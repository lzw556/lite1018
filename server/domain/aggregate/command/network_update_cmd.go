package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type NetworkUpdateCmd struct {
	entity.Network

	networkRepo     dependency.NetworkRepository
	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
}

func NewNetworkUpdateCmd() NetworkUpdateCmd {
	return NetworkUpdateCmd{
		networkRepo:     repository.Network{},
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
	}
}

func (cmd NetworkUpdateCmd) Update(req request.Network) (*vo.Network, error) {
	cmd.Network.CommunicationPeriod = req.WSN.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.WSN.CommunicationTimeOffset
	cmd.Network.GroupInterval = req.WSN.GroupInterval
	cmd.Network.GroupSize = req.WSN.GroupSize
	cmd.Network.Name = req.Name
	cmd.Network.ProjectID = req.ProjectID
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network); err != nil {
			return err
		}
		return nil
	})
	gateway, err := cmd.deviceRepo.Get(context.TODO(), cmd.Network.GatewayID)
	if err != nil {
		return nil, err
	}
	if state, err := cmd.deviceStateRepo.Get(gateway.MacAddress); err == nil && state.IsOnline {
		go command.SyncWsnSettings(cmd.Network, gateway, true, 3*time.Second)
	}
	result := vo.NewNetwork(cmd.Network)
	return &result, nil
}

func (cmd NetworkUpdateCmd) AddDevices(parentID uint, childrenID []uint) error {
	ctx := context.TODO()
	parent, err := cmd.deviceRepo.Get(ctx, parentID)
	if err != nil {
		return response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	children, err := cmd.deviceRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(childrenID))
	if err != nil {
		return err
	}
	for i := range children {
		children[i].Parent = parent.MacAddress
		children[i].NetworkID = parent.NetworkID
	}
	if err := cmd.deviceRepo.BatchSave(ctx, children); err != nil {
		return err
	}
	if err != nil {
		return err
	}
	gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID)
	if err != nil {
		return err
	}
	for _, child := range children {
		go command.AddDevice(gateway, child, parent)
	}
	return nil
}

func (cmd NetworkUpdateCmd) AddNewDevices(req request.AddDevices) error {
	if t := devicetype.Get(req.DeviceType); t != nil {
		ctx := context.TODO()
		device, err := cmd.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.MacAddress))
		if device.ID != 0 {
			return response.BusinessErr(errcode.DeviceMacExistsError, "")
		}
		parent, err := cmd.deviceRepo.Get(ctx, req.ParentID)
		if err != nil {
			return response.BusinessErr(errcode.DeviceNotFoundError, "")
		}
		device = entity.Device{
			Name:       req.Name,
			MacAddress: req.MacAddress,
			Parent:     parent.MacAddress,
			NetworkID:  cmd.Network.ID,
			Type:       req.DeviceType,
			ProjectID:  req.ProjectID,
		}
		device.Settings = make(entity.DeviceSettings, len(t.Settings()))
		for i, setting := range t.Settings() {
			device.Settings[i] = entity.DeviceSetting{
				Key:      setting.Key,
				Value:    setting.Value,
				Category: string(setting.Category),
			}
		}
		return cmd.deviceRepo.Create(ctx, &device)
	}
	return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (cmd NetworkUpdateCmd) RemoveDevices(req request.RemoveDevices) error {
	ctx := context.TODO()
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(req.DeviceIDs))
	if err != nil {
		return err
	}
	for i := range devices {
		devices[i].NetworkID = 0
		devices[i].Parent = ""
	}
	gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID)
	if err != nil {
		return err
	}
	err = transaction.Execute(ctx, func(txCtx context.Context) error {
		for _, device := range devices {
			if state, err := cmd.deviceStateRepo.Get(device.MacAddress); err == nil {
				state.IsOnline = false
				_ = cmd.deviceStateRepo.Create(device.MacAddress, state)
			}
			if err := cmd.deviceRepo.UpdatesBySpecs(txCtx, map[string]interface{}{"parent": gateway.MacAddress}, spec.ParentEqSpec(device.MacAddress)); err != nil {
				return err
			}
		}
		return cmd.deviceRepo.BatchSave(txCtx, devices)
	})
	if err != nil {
		return err
	}
	devices, err = cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(cmd.Network.ID))
	if err != nil {
		return err
	}
	for i := range devices {
		device := devices[i]
		go command.DeleteDevice(gateway, device)
	}
	return nil
}
