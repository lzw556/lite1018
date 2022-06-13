package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type ProjectExportCmd struct {
	entity.Project

	assetRepo                        dependency.AssetRepository
	networkRepo                      dependency.NetworkRepository
	deviceRepo                       dependency.DeviceRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
}

func NewProjectExportCmd() ProjectExportCmd {
	return ProjectExportCmd{
		assetRepo:                        repository.Asset{},
		networkRepo:                      repository.Network{},
		deviceRepo:                       repository.Device{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
	}
}

func (cmd ProjectExportCmd) Run() (*vo.ProjectExported, error) {
	result := vo.ProjectExported{}

	networks, err := cmd.networkRepo.FindBySpecs(context.TODO(), spec.ProjectEqSpec(cmd.Project.ID))
	if err != nil {
		return nil, err
	}

	result.Networks = make([]*vo.NetworkExportFile, len(networks))
	for i, network := range networks {
		netCmd := NewNetworkExportCmd()
		netCmd.Network = network
		devs, err := cmd.deviceRepo.FindBySpecs(context.TODO(), spec.ProjectEqSpec(cmd.Project.ID), spec.NetworkEqSpec(network.ID))
		if err != nil {
			return nil, err
		}
		netCmd.Devices = devs
		networkExported := netCmd.Run()
		result.Networks[i] = networkExported
	}

	err = cmd.appendAssets(&result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (cmd ProjectExportCmd) appendAssets(p *vo.ProjectExported) error {
	q := query.NewAssetQuery()
	q.Specs = []spec.Specification{spec.ProjectEqSpec(cmd.Project.ID), spec.ParentIDEqSpec(0)}
	voAssets, err := q.List()
	if err != nil {
		return err
	}

	p.Assets = make([]*vo.AssetExported, len(voAssets))
	for i := range voAssets {
		p.Assets[i] = &vo.AssetExported{}
		cmd.iterConvertAsset(p.Assets[i], voAssets[i])
	}

	return nil
}

func (cmd ProjectExportCmd) convertMonitoringPoint(mpe *vo.MonitoringPointExported, mp vo.MonitoringPoint) error {
	mpe.ID = mp.ID
	mpe.Name = mp.Name
	mpe.Type = mp.Type
	mpe.Attributes = mp.Attributes

	mpe.Devices = make([]*vo.DeviceBinding, len(mp.BindingDevices))
	for i, dev := range mp.BindingDevices {
		mpe.Devices[i] = &vo.DeviceBinding{}
		binding, err := cmd.monitoringPointDeviceBindingRepo.GetByDeviceID(context.TODO(), dev.ID)
		if err != nil {
			return err
		}

		mpe.Devices[i].Address = dev.MacAddress
		mpe.Devices[i].ProcessID = binding.ProcessID
		mpe.Devices[i].Parameters = binding.Parameters
	}

	return nil
}

func (cmd ProjectExportCmd) iterConvertAsset(ae *vo.AssetExported, a vo.Asset) error {
	ae.ID = a.ID
	ae.Name = a.Name
	ae.Type = a.Type
	ae.Attributes = a.Attributes

	ae.MonitoringPoints = make([]*vo.MonitoringPointExported, len(a.MonitoringPoints))
	for i := range a.MonitoringPoints {
		ae.MonitoringPoints[i] = &vo.MonitoringPointExported{}
		if err := cmd.convertMonitoringPoint(ae.MonitoringPoints[i], *a.MonitoringPoints[i]); err != nil {
			return err
		}
	}

	ae.Children = make([]*vo.AssetExported, len(a.Children))
	for i := range a.Children {
		ae.Children[i] = &vo.AssetExported{}
		if err := cmd.iterConvertAsset(ae.Children[i], *a.Children[i]); err != nil {
			return err
		}
	}

	return nil
}
