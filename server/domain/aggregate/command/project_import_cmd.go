package command

import (
	"context"
	"errors"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type ProjectImportCmd struct {
	entity.Project

	assetRepo                        dependency.AssetRepository
	networkRepo                      dependency.NetworkRepository
	deviceRepo                       dependency.DeviceRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
}

func NewProjectImportCmd() ProjectImportCmd {
	return ProjectImportCmd{
		assetRepo:                        repository.Asset{},
		networkRepo:                      repository.Network{},
		deviceRepo:                       repository.Device{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
	}
}

func (cmd ProjectImportCmd) newNetworkImportCmd(req request.ImportNetwork) (*NetworkImportCmd, error) {
	ctx := context.TODO()
	netCmd := NewNetworkImportCmd()
	// 构建网络实体
	netCmd.Network = entity.Network{
		CommunicationPeriod:     req.Wsn.CommunicationPeriod,
		CommunicationTimeOffset: req.Wsn.CommunicationOffset,
		GroupSize:               req.Wsn.GroupSize,
		GroupInterval:           req.Wsn.GroupInterval,
		ProjectID:               req.ProjectID,
	}
	// 构建网络中的设备实体
	netCmd.Devices = make([]entity.Device, len(req.Devices))
	for i, device := range req.Devices {
		e, err := cmd.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(device.MacAddress))
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.BusinessErr(errcode.DeviceMacExistsError, device.MacAddress)
		}
		e.Name = device.Name
		e.MacAddress = device.MacAddress
		e.Type = device.TypeID
		e.ProjectID = req.ProjectID
		e.Settings = make(entity.DeviceSettings, 0)
		if t := devicetype.Get(device.TypeID); t != nil {
			for _, setting := range t.Settings() {
				for k, v := range device.Settings[string(setting.Category)] {
					if k == setting.Key {
						e.Settings = append(e.Settings, entity.DeviceSetting{
							Category: string(setting.Category),
							Key:      setting.Key,
							Value:    v,
						})
					}
				}
			}
		} else {
			return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
		}
		if e.Type == devicetype.GatewayType {
			netCmd.Network.Name = device.Name
		} else {
			e.Parent = device.ParentAddress
		}
		netCmd.Devices[i] = e
	}
	return &netCmd, nil
}

func (cmd ProjectImportCmd) convertNet(netImported request.NetworkImported) request.ImportNetwork {
	result := request.ImportNetwork{
		Wsn:     netImported.Wsn,
		Devices: make([]request.ImportDevice, 0),
	}

	for _, dev := range netImported.DeviceList {
		result.Devices = append(result.Devices, request.ImportDevice{
			Name:          dev.Name,
			MacAddress:    dev.Address,
			ParentAddress: dev.ParentAddress,
			TypeID:        dev.Type,
			Settings:      dev.Settings,
		})
	}

	return result
}

func (cmd ProjectImportCmd) ImportProject(req request.ProjectImported) error {
	for _, network := range req.Networks {
		netImported := cmd.convertNet(network)
		netImported.ProjectID = cmd.Project.ID

		netCmd, err := cmd.newNetworkImportCmd(netImported)
		if err != nil {
			return err
		}

		if err := netCmd.Run(); err != nil {
			return err
		}
	}

	for _, asset := range req.Assets {
		if err := cmd.iterCreateAsset(cmd.Project.ID, 0, asset); err != nil {
			return err
		}
	}

	return nil
}

func (cmd ProjectImportCmd) iterCreateAsset(projectID uint, parentId uint, asset request.AssetImported) error {
	e := entity.Asset{
		Name:       asset.Name,
		Type:       asset.Type,
		Attributes: asset.Attributes,
		ParentID:   parentId,
		ProjectID:  projectID,
	}

	assetCreateCmd := NewAssetCreateCmd()
	assetCreateCmd.Asset = e
	if err := assetCreateCmd.Run(); err != nil {
		return err
	}

	for _, mp := range asset.MonitoringPoints {
		if err := cmd.createMonitoringPoint(projectID, assetCreateCmd.Asset.ID, *mp); err != nil {
			return err
		}
	}

	for _, child := range asset.Children {
		if err := cmd.iterCreateAsset(projectID, assetCreateCmd.Asset.ID, *child); err != nil {
			return err
		}
	}

	return nil
}

func (cmd ProjectImportCmd) createMonitoringPoint(projectID uint, assetId uint, mp request.MonitoringPointImported) error {
	e := entity.MonitoringPoint{
		Name:       mp.Name,
		Type:       mp.Type,
		AssetID:    assetId,
		ProjectID:  projectID,
		Attributes: mp.Attributes,
	}

	mpCreateCmd := NewMonitoringPointCreateCmd()
	mpCreateCmd.MonitoringPoint = e
	mpCreated, err := mpCreateCmd.Run()
	if err != nil {
		return err
	}

	for _, binding := range mp.Devices {
		if err := cmd.createBinding(mpCreated, *binding); err != nil {
			return err
		}
	}

	return nil
}

func (cmd ProjectImportCmd) createBinding(mp entity.MonitoringPoint, binding request.DeviceBinding) error {

	dev, err := cmd.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(binding.Address))
	if err != nil {
		return err
	}

	bindCmd := NewMonitoringPointBindDeviceCmd()
	bindCmd.MonitoringPoint = mp
	if err := bindCmd.BindDevice(request.BindDevice{
		DeviceID:   dev.ID,
		ProcessID:  binding.ProcessID,
		Parameters: binding.Parameters,
	}); err != nil {
		return err
	}

	return err
}
