package factory

import (
	"context"
	"errors"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Network struct {
	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewNetwork() Network {
	return Network{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (factory Network) NewNetworkQuery(filters ...request.Filter) *query.NetworkQuery {
	q := query.NewNetworkQuery()
	q.Specs = factory.buildSpecs(filters)
	return &q
}

func (factory Network) NewNetworkCreateCmd(req request.CreateNetwork) (*command.NetworkCreateCmd, error) {
	ctx := context.TODO()
	gateway, _ := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.Gateway.MacAddress))
	if gateway.ID != 0 {
		return nil, response.BusinessErr(errcode.DeviceMacExistsError, "")
	}
	cmd := command.NewNetworkCreateCmd()
	cmd.Network = entity.Network{
		Name:                    req.Name,
		ProjectID:               req.ProjectID,
		CommunicationPeriod:     req.WSN.CommunicationPeriod,
		CommunicationTimeOffset: req.WSN.CommunicationTimeOffset,
		GroupSize:               req.WSN.GroupSize,
		GroupInterval:           req.WSN.GroupInterval,
		RoutingTables:           make(entity.RoutingTables, 0),
	}
	cmd.Network.Gateway = entity.Device{
		MacAddress: req.Gateway.MacAddress,
		Name:       fmt.Sprintf("%s-网关", req.Name),
		Type:       devicetype.GatewayType,
		ProjectID:  req.ProjectID,
	}
	return &cmd, nil
}

func (factory Network) NewNetworkImportCmd(req request.ImportNetwork) (*command.NetworkImportCmd, error) {
	ctx := context.TODO()
	cmd := command.NewNetworkImportCmd()
	// 构建网络实体
	cmd.Network = entity.Network{
		CommunicationPeriod:     req.CommunicationPeriod,
		CommunicationTimeOffset: req.CommunicationTimeOffset,
		GroupSize:               req.GroupSize,
		GroupInterval:           req.GroupInterval,
		RoutingTables:           make(entity.RoutingTables, len(req.RoutingTables)),
		ProjectID:               req.ProjectID,
	}
	for i, table := range req.RoutingTables {
		cmd.RoutingTables[i] = entity.RoutingTable{
			table[0],
			table[1],
		}
	}
	// 构建网络中的设备实体
	cmd.Devices = make([]entity.Device, len(req.Devices))
	for i, device := range req.Devices {
		e, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(device.MacAddress))
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
			cmd.Network.Name = device.Name
		}
		cmd.Devices[i] = e
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

func (factory Network) NewNetworkUpdateCmd(id uint) (*command.NetworkUpdateCmd, error) {
	ctx := context.TODO()
	e, err := factory.networkRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	cmd := command.NewNetworkUpdateCmd()
	cmd.Network = e
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

func (factory Network) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		}
	}
	return specs
}
