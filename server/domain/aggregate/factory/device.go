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
	"strings"
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

func (factory Device) NewDeviceCreateCmd(req request.CreateDevice) (*command.DeviceCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.MacAddress))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, response.BusinessErr(errcode.DeviceMacExistsError, req.MacAddress)
	}
	if t := devicetype.Get(req.TypeID); t != nil {
		cmd := command.NewDeviceCreateCmd()
		e.Name = req.Name
		e.MacAddress = req.MacAddress
		e.Type = req.TypeID
		e.ProjectID = req.ProjectID
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
			case devicetype.WsnSettingCategory:
				settings = req.Wsn
			}
			if value, ok := settings[setting.Key]; ok {
				s.Value = setting.Convert(value)
			} else {
				s.Value = setting.Convert(setting.Value)
			}
			e.Settings[i] = s
		}
		if !e.IsNB() {
			network, err := factory.networkRepo.Get(ctx, req.NetworkID)
			if err != nil {
				return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
			}
			cmd.Network = network
			e.NetworkID = network.ID
			parent, err := factory.deviceRepo.Get(ctx, req.ParentID)
			if err != nil || parent.NetworkID != network.ID {
				return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
			}
			e.Parent = parent.MacAddress
		}
		cmd.Device = e
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

func (factory Device) NewDeviceQuery(filters request.Filters) *query.DeviceQuery {
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
	if device.IsNB() {
		cmd.Gateway = device
	} else {
		network, err := factory.networkRepo.Get(ctx, device.NetworkID)
		if err != nil {
			return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
		}
		gateway, err := factory.deviceRepo.Get(ctx, network.GatewayID)
		if err != nil {
			return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
		}
		cmd.Gateway = gateway
	}
	return &cmd, nil
}

func (factory Device) NewDeviceUpgradeCmd(deviceID uint) (*command.DeviceUpgradeCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.Get(ctx, deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	cmd := command.NewDeviceUpgradeCmd()
	cmd.Device = e
	if e.IsNB() {
		cmd.Gateway = e
	} else {
		network, err := factory.networkRepo.Get(ctx, e.NetworkID)
		if err != nil {
			return nil, err
		}
		gateway, err := factory.deviceRepo.Get(ctx, network.GatewayID)
		if err != nil {
			return nil, err
		}
		cmd.Gateway = gateway
	}
	return &cmd, nil
}

func (factory Device) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for name, v := range filters {
		switch name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "network_id":
			specs = append(specs, spec.NetworkEqSpec(cast.ToUint(v)))
		case "type":
			specs = append(specs, spec.TypeEqSpec(cast.ToUint(v)))
		case "types":
			types := strings.Split(cast.ToString(v), ",")
			typeInSpec := make(spec.TypeInSpec, len(types))
			for i, t := range types {
				typeInSpec[i] = cast.ToUint(t)
			}
			specs = append(specs, typeInSpec)
		case "name":
			specs = append(specs, spec.DeviceNameEqSpec(cast.ToString(v)))
		case "mac_address":
			specs = append(specs, spec.DeviceMacEqSpec(cast.ToString(v)))
		}
	}
	return specs
}
