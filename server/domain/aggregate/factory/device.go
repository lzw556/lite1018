package factory

import (
	"context"
	"errors"
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

type Device struct {
	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewDevice() Device {
	return Device{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (factory Device) NewDeviceCreateCmd(req request.Device) (*command.DeviceCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.MacAddress))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, response.BusinessErr(errcode.DeviceMacExistsError, req.MacAddress)
	}
	e.Name = req.Name
	e.MacAddress = req.MacAddress
	e.Type = req.TypeID
	e.ProjectID = req.ProjectID
	e.NetworkID = req.NetworkID
	parent, err := factory.deviceRepo.Get(ctx, req.ParentID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	if t := devicetype.Get(req.TypeID); t != nil {
		e.Settings = make(entity.DeviceSettings, len(t.Settings()))
		for i, setting := range t.Settings() {
			s := entity.DeviceSetting{
				Key:      setting.Key,
				Category: string(setting.Category),
			}
			var settings map[string]interface{}
			switch setting.Category {
			case devicetype.SensorsSettingCategory:
				settings = req.Sensors
			case devicetype.IpnSettingCategory:
				settings = req.IPN
			}
			if value, ok := settings[setting.Key]; ok {
				s.Value = setting.Convert(value)
			} else {
				s.Value = setting.Convert(setting.Value)
			}
			e.Settings[i] = s
		}
		cmd := command.NewDeviceCreateCmd()
		cmd.Device = e
		cmd.Parent = parent
		return &cmd, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (factory Device) NewDeviceRemoveCmd(deviceID uint) (*command.DeviceRemoveCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.Get(ctx, deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewDeviceRemoveCmd()
	cmd.Device = e
	if e.NetworkID != 0 {
		cmd.Network, _ = factory.networkRepo.Get(ctx, e.NetworkID)
	}
	return &cmd, nil
}

func (factory Device) NewDeviceUpdateCmd(deviceID uint) (*command.DeviceUpdateCmd, error) {
	e, err := factory.deviceRepo.Get(context.TODO(), deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewDeviceUpdateCmd()
	cmd.Device = e
	return &cmd, nil
}

func (factory Device) NewDeviceQuery(filters ...request.Filter) *query.DeviceQuery {
	q := query.NewDeviceQuery()
	q.Specs = factory.buildSpecs(filters)
	return &q
}

func (factory Device) NewDeviceExecuteCommandCmd(deviceID uint) (*command.DeviceExecuteCommandCmd, error) {
	ctx := context.TODO()
	device, err := factory.deviceRepo.Get(ctx, deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewDeviceExecuteCommandCmd()
	cmd.Device = device
	network, err := factory.networkRepo.Get(ctx, device.NetworkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	gateway, err := factory.deviceRepo.Get(ctx, network.GatewayID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd.Gateway = gateway
	return &cmd, nil
}

func (factory Device) NewDeviceUpgradeCmd(deviceID uint) (*command.DeviceUpgradeCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.Get(ctx, deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	network, err := factory.networkRepo.Get(ctx, e.NetworkID)
	if err != nil {
		return nil, err
	}
	gateway, err := factory.deviceRepo.Get(ctx, network.GatewayID)
	if err != nil {
		return nil, err
	}
	cmd := command.NewDeviceUpgradeCmd()
	cmd.Device = e
	cmd.Gateway = gateway
	return &cmd, nil
}

func (factory Device) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		case "network_id":
			specs = append(specs, spec.NetworkEqSpec(cast.ToUint(filter.Value)))
		case "category":
			specs = append(specs, spec.CategoryEqSpec(cast.ToUint(filter.Value)))
		case "type":
			specs = append(specs, spec.TypeEqSpec(cast.ToUint(filter.Value)))
		case "name":
			specs = append(specs, spec.DeviceNameEqSpec(cast.ToString(filter.Value)))
		case "mac_address":
			specs = append(specs, spec.DeviceMacEqSpec(cast.ToString(filter.Value)))
		}
	}
	return specs
}
