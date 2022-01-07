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
	propertyRepo    dependency.PropertyRepository
	measurementRepo dependency.MeasurementRepository
	bindingRepo     dependency.MeasurementDeviceBindingRepository
}

func NewDevice() Device {
	return Device{
		deviceRepo:      repository.Device{},
		networkRepo:     repository.Network{},
		propertyRepo:    repository.Property{},
		measurementRepo: repository.Measurement{},
		bindingRepo:     repository.MeasurementDeviceBinding{},
	}
}

func (factory Device) NewDeviceCreateCmd(req request.Device) (command.DeviceCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.MacAddress))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, response.BusinessErr(errcode.DeviceMacExistsError, req.MacAddress)
	}
	e.Name = req.Name
	e.MacAddress = req.MacAddress
	e.Type = req.TypeID
	switch req.TypeID {
	case devicetype.GatewayType:
		return factory.newGatewayCreateCmd(e.Device, req)
	case devicetype.RouterType:
		return factory.newRouterCreateCmd(e.Device, req)
	case devicetype.BoltLooseningType,
		devicetype.BoltElongationType,
		devicetype.VibrationTemperature3AxisType,
		devicetype.AngleDipType,
		devicetype.NormalTemperatureCorrosionType,
		devicetype.HighTemperatureCorrosionType:
		return factory.newSensorCreateCmd(e.Device, req)
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (factory Device) newGatewayCreateCmd(e po.Device, req request.Device) (*command.GatewayCreateCmd, error) {
	e.NetworkID = req.NetworkID
	e.Category = po.GatewayCategory
	e.IPN = req.IPN
	cmd := command.NewGatewayCreateCmd()
	cmd.Device = e
	cmd.Network = po.Network{
		Name:                    req.Name,
		CommunicationPeriod:     req.WSN.CommunicationPeriod,
		CommunicationTimeOffset: req.WSN.CommunicationTimeOffset,
		GroupSize:               req.WSN.GroupSize,
		GroupInterval:           req.WSN.GroupInterval,
		RoutingTables:           make(po.RoutingTables, 0),
	}
	return &cmd, nil
}

func (factory Device) newRouterCreateCmd(e po.Device, req request.Device) (*command.RouterCreateCmd, error) {
	e.NetworkID = req.NetworkID
	e.Category = po.RouterCategory
	cmd := command.NewRouterCreateCmd()
	cmd.Device = e
	return &cmd, nil
}

func (factory Device) newSensorCreateCmd(e po.Device, req request.Device) (*command.SensorCreateCmd, error) {
	e.NetworkID = req.NetworkID
	e.Category = po.SensorCategory
	e.Sensors = req.Sensors
	cmd := command.NewSensorCreateCmd()
	cmd.Device = e
	return &cmd, nil
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

func (factory Device) NewDeviceGroupByQuery(deviceType uint) (*query.DeviceGroupByQuery, error) {
	ctx := context.TODO()
	es, err := factory.deviceRepo.FindBySpecs(ctx, spec.TypeEqSpec(deviceType))
	if err != nil {
		return nil, err
	}
	q := query.NewDeviceGroupByQuery()
	q.Devices = es
	return &q, nil
}

func (factory Device) NewDevicePagingQuery(page, size int, filters request.Filters) (*query.DevicePagingQuery, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			specs = append(specs, spec.AssetEqSpec(cast.ToUint(filter.Value)))
		case "name":
			specs = append(specs, spec.DeviceNameEqSpec(cast.ToString(filter.Value)))
		case "mac_address":
			specs = append(specs, spec.DeviceMacEqSpec(cast.ToString(filter.Value)))
		case "network_id":
			specs = append(specs, spec.NetworkEqSpec(cast.ToUint(filter.Value)))
		}
	}
	es, total, err := factory.deviceRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	cmd := query.NewDevicePagingQuery(total)
	cmd.Devices = es
	cmd.PropertiesMap = map[uint][]po.Property{}
	for _, e := range es {
		if _, ok := cmd.PropertiesMap[e.Type]; !ok {
			cmd.PropertiesMap[e.Type], _ = factory.propertyRepo.FindByDeviceTypeID(ctx, e.Type)
		}
	}
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

func (factory Device) NewDeviceStatisticsQuery(filters request.Filters) (*query.DeviceStatisticsQuery, error) {
	specs := factory.buildFilterSpec(filters)
	es, err := factory.deviceRepo.FindBySpecs(context.TODO(), specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewDeviceStatisticsQuery()
	q.Devices = es
	return &q, nil
}

func (factory Device) NewDeviceListQueryByFilter(filters request.Filters) (*query.DeviceListQuery, error) {
	ctx := context.TODO()
	specs := factory.buildFilterSpec(filters)
	es, err := factory.deviceRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewDeviceListQuery()
	q.Devices = es
	return &q, nil
}

func (factory Device) buildFilterSpec(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			specs = append(specs, spec.AssetEqSpec(cast.ToUint(filter.Value)))
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
		}
	}
	return specs
}
