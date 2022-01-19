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
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Device struct {
	deviceRepo      dependency.DeviceRepository
	networkRepo     dependency.NetworkRepository
	measurementRepo dependency.MeasurementRepository
	bindingRepo     dependency.MeasurementDeviceBindingRepository
}

func NewDevice() Device {
	return Device{
		deviceRepo:      repository.Device{},
		networkRepo:     repository.Network{},
		measurementRepo: repository.Measurement{},
		bindingRepo:     repository.MeasurementDeviceBinding{},
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
	if t := devicetype.Get(req.TypeID); t != nil {
		e.Settings = make(po.DeviceSettings, len(t.Settings()))
		for i, setting := range t.Settings() {
			s := po.DeviceSetting{
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
		cmd.Device = e.Device
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

func (factory Device) NewDeviceQuery(id uint) (*query.DeviceQuery, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	q := query.NewDeviceQuery()
	q.Device = e
	return &q, nil
}

func (factory Device) NewDevicePagingQuery(page, size int, filters request.Filters) (*query.DevicePagingQuery, error) {
	ctx := context.TODO()
	specs := factory.buildSpecs(filters)
	es, total, err := factory.deviceRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	cmd := query.NewDevicePagingQuery(total)
	cmd.Devices = es
	return &cmd, nil
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

func (factory Device) NewDeviceChildrenQuery(id uint) (*query.DeviceChildrenQuery, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	network, err := factory.networkRepo.Get(ctx, e.NetworkID)
	if err != nil {
		return nil, response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	macs := network.GetChildren(e.MacAddress)
	if len(macs) > 0 {
		children, err := factory.deviceRepo.FindBySpecs(ctx, spec.DeviceMacInSpec(macs))
		if err != nil {
			return nil, err
		}
		q := query.NewDeviceChildrenQuery()
		q.Devices = children
		return &q, nil
	}
	return nil, fmt.Errorf("has no children")
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

func (factory Device) NewDeviceFilterQuery(filters request.Filters) (*query.DeviceFilterQuery, error) {
	ctx := context.TODO()
	specs := factory.buildSpecs(filters)
	es, err := factory.deviceRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewDeviceFilterQuery()
	q.Devices = es
	return &q, nil
}

func (factory Device) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		case "network_id":
			specs = append(specs, spec.NetworkEqSpec(cast.ToUint(filter.Value)))
		case "measurement_id":
			bindings, _ := factory.bindingRepo.FindBySpecs(context.TODO(), spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
			macSpecs := make(spec.DeviceMacInSpec, len(bindings))
			for i, binding := range bindings {
				macSpecs[i] = binding.MacAddress
			}
			specs = append(specs, macSpecs)
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
