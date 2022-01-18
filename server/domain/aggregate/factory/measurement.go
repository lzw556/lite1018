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

type Measurement struct {
	assetRepo       dependency.AssetRepository
	deviceRepo      dependency.DeviceRepository
	measurementRepo dependency.MeasurementRepository
}

func NewMeasurement() Measurement {
	return Measurement{
		assetRepo:       repository.Asset{},
		deviceRepo:      repository.Device{},
		measurementRepo: repository.Measurement{},
	}
}

func (factory Measurement) NewMeasurementCreateCmd(req request.CreateMeasurement) (*command.MeasurementCreateCmd, error) {
	ctx := context.TODO()
	asset, err := factory.assetRepo.Get(ctx, req.Asset)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
	}
	cmd := command.NewMeasurementCreateCmd()
	cmd.Measurement.Name = req.Name
	cmd.Measurement.AssetID = asset.ID
	cmd.Measurement.Type = req.Type
	cmd.PollingPeriod = req.PollingPeriod
	cmd.Settings = req.Settings
	cmd.Mode = po.AcquisitionMode(req.Mode)
	cmd.Bindings = make([]po.MeasurementDeviceBinding, len(req.BindingDevices))
	t := devicetype.Get(req.DeviceType)
	if t == nil {
		return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	cmd.SensorSettings = make([]po.DeviceSetting, len(t.Settings()))
	for i, setting := range t.Settings() {
		s := po.DeviceSetting{
			Key:      setting.Key,
			Category: string(setting.Category),
		}
		if v, ok := req.Sensors[setting.Key]; ok {
			s.Value = setting.Convert(v)
		} else {
			s.Value = setting.Convert(setting.Value)
		}
		cmd.SensorSettings[i] = s
	}

	for i, binding := range req.BindingDevices {
		device, err := factory.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(binding.Value))
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			device.Device = po.Device{
				Name:       fmt.Sprintf("%s-%d", req.Name, binding.Index),
				MacAddress: binding.Value,
				Type:       req.DeviceType,
				AssetID:    asset.ID,
				Settings:   cmd.SensorSettings,
				Category:   po.SensorCategory,
			}
		}
		cmd.Devices = append(cmd.Devices, device)
		cmd.Bindings[i] = po.MeasurementDeviceBinding{
			MacAddress: binding.Value,
			Index:      binding.Index,
		}
		cmd.Measurement.Display.Location.X = req.Location.X
		cmd.Measurement.Display.Location.Y = req.Location.Y
	}
	return &cmd, nil
}

func (factory Measurement) NewMeasurementListQueryByAssetID(id uint) (*query.MeasurementListQuery, error) {
	ctx := context.TODO()
	asset, err := factory.assetRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
	}
	es, err := factory.measurementRepo.FindBySpecs(ctx, spec.AssetEqSpec(asset.ID))
	if err != nil {
		return nil, err
	}
	q := query.NewMeasurementListQuery()
	q.Measurements = es
	return &q, nil
}

func (factory Measurement) NewMeasurementFilterQuery(filters request.Filters) (*query.MeasurementFilterQuery, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			specs = append(specs, spec.AssetEqSpec(cast.ToUint(filter.Value)))
		case "type":
			specs = append(specs, spec.TypeEqSpec(cast.ToInt(filter.Value)))
		}
	}
	es, err := factory.measurementRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewMeasurementFilterQuery()
	q.Measurements = es
	return &q, nil
}

func (factory Measurement) NewMeasurementQuery(id uint) (*query.MeasurementQuery, error) {
	ctx := context.TODO()
	e, err := factory.measurementRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.MeasurementNotFoundError, "")
	}
	q := query.NewMeasurementQuery()
	q.Measurement = e
	return &q, nil
}

func (factory Measurement) NewMeasurementUpdateCmd(id uint) (*command.MeasurementUpdateCmd, error) {
	e, err := factory.measurementRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	cmd := command.NewMeasurementUpdateCmd()
	cmd.Measurement = e
	return &cmd, nil
}

func (factory Measurement) NewMeasurementRemoveCmd(id uint) (*command.MeasurementRemoveCmd, error) {
	e, err := factory.measurementRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.MeasurementNotFoundError, "")
	}
	cmd := command.NewMeasurementRemoveCmd()
	cmd.Measurement = e
	return &cmd, nil
}
