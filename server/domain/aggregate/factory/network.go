package factory

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Network struct {
	assetRepo   dependency.AssetRepository
	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewNetwork() Network {
	return Network{
		assetRepo:   repository.Asset{},
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (factory Network) NewNetworkQuery(networkID uint) (*query.NetworkQuery, error) {
	ctx := context.TODO()
	e, err := factory.networkRepo.Get(ctx, networkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	q := query.NewNetworkQuery()
	q.Network = e
	return &q, nil
}

func (factory Network) NewNetworksQuery(assetID uint) (*query.NetworksQuery, error) {
	ctx := context.TODO()
	es, err := factory.deviceRepo.FindBySpecs(ctx, spec.AssetEqSpec(assetID), spec.TypeEqSpec(devicetype.GatewayType))
	if err != nil {
		return nil, err
	}
	ids := make([]uint, len(es))
	for i, e := range es {
		ids[i] = e.NetworkID
	}
	networks, err := factory.networkRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(ids))
	if err != nil {
		return nil, err
	}
	q := query.NewNetworksQuery()
	q.Networks = networks
	return &q, nil
}

func (factory Network) NewNetworkCreateCmd(req request.ImportNetwork) (*command.NetworkCreateCmd, error) {
	ctx := context.TODO()
	asset, err := factory.assetRepo.Get(ctx, req.AssetID)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
	}

	cmd := command.NewNetworkCreateCmd()
	// 构建网络实体
	cmd.Network = po.Network{
		CommunicationPeriod:     req.CommunicationPeriod,
		CommunicationTimeOffset: req.CommunicationTimeOffset,
		GroupSize:               req.GroupSize,
		GroupInterval:           req.GroupInterval,
		RoutingTables:           make(po.RoutingTables, len(req.RoutingTables)),
	}
	for i, table := range req.RoutingTables {
		cmd.RoutingTables[i] = po.RoutingTable{
			table[0],
			table[1],
		}
	}
	// 构建网络中的设备实体
	cmd.Devices = make([]po.Device, len(req.Devices))
	for i, device := range req.Devices {
		e, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(device.MacAddress))
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.BusinessErr(errcode.DeviceMacExistsError, device.MacAddress)
		}
		e.Name = device.Name
		e.MacAddress = device.MacAddress
		e.AssetID = asset.ID
		e.TypeID = device.TypeID
		switch e.TypeID {
		case devicetype.GatewayType:
			cmd.Network.Name = device.Name
			e.Category = po.GatewayCategory
			e.SetIPN(device.IPN)
		case devicetype.RouterType:
			e.Category = po.SensorCategory
		default:
			e.Category = po.SensorCategory
			e.SetSensors(device.Sensors)
		}
		cmd.Devices[i] = e.Device
	}

	return &cmd, nil
}

func (factory Network) NewNetworkExportCmd(networkID uint) (*command.NetworkExportCmd, error) {
	ctx := context.TODO()
	e, err := factory.networkRepo.Get(ctx, networkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	cmd := command.NewNetworkExportCmd()
	cmd.Network = e
	devices, err := factory.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(e.ID))
	if err != nil {
		return nil, err
	}
	cmd.Devices = devices
	return &cmd, nil
}

func (factory Network) NewNetworkUpdateCmd(gatewayID uint) (*command.NetworkUpdateCmd, error) {
	ctx := context.TODO()
	gateway, err := factory.deviceRepo.Get(ctx, gatewayID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	e, err := factory.networkRepo.GetBySpecs(ctx, spec.GatewayEqSpec(gateway.ID))
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	cmd := command.NewNetworkUpdateCmd()
	cmd.Network = e
	cmd.Gateway = gateway
	return &cmd, nil
}

func (factory Network) NewNetworkUpdateCmdByID(id uint) (*command.NetworkUpdateCmd, error) {
	ctx := context.TODO()
	network, err := factory.networkRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	gateway, err := factory.deviceRepo.Get(ctx, network.GatewayID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewNetworkUpdateCmd()
	cmd.Network = network
	cmd.Gateway = gateway
	return &cmd, nil
}

func (factory Network) NewNetworkSyncCmd(networkID uint) (*command.NetworkSyncCommand, error) {
	ctx := context.TODO()
	network, err := factory.networkRepo.Get(ctx, networkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	devices, err := factory.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(network.ID))
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewNetworkSyncCommand()
	cmd.Network = network
	cmd.Devices = devices
	return &cmd, nil
}

func (factory Network) NewNetworkRemoveCmd(networkID uint) (*command.NetworkRemoveCmd, error) {
	ctx := context.TODO()
	network, err := factory.networkRepo.Get(ctx, networkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	cmd := command.NewNetworkRemoveCmd()
	cmd.Network = network
	return &cmd, nil
}
