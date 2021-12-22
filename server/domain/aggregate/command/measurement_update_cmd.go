package command

import (
	"context"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/crontask"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"gorm.io/gorm"
)

type MeasurementUpdateCmd struct {
	po.Measurement

	deviceRepo      dependency.DeviceRepository
	measurementRepo dependency.MeasurementRepository
	bindingRepo     dependency.MeasurementDeviceBindingRepository
	networkRepo     dependency.NetworkRepository
}

func NewMeasurementUpdateCmd() MeasurementUpdateCmd {
	return MeasurementUpdateCmd{
		deviceRepo:      repository.Device{},
		measurementRepo: repository.Measurement{},
		bindingRepo:     repository.MeasurementDeviceBinding{},
		networkRepo:     repository.Network{},
	}
}

func (cmd MeasurementUpdateCmd) Update(req request.CreateMeasurement) error {
	periodIsChanged := cmd.Measurement.SamplePeriodTimeOffset != req.SamplePeriodTimeOffset || cmd.SamplePeriod != req.SamplePeriod
	cmd.Measurement.Display.Location = req.Location
	cmd.Measurement.Name = req.Name
	cmd.Measurement.AssetID = req.Asset
	cmd.Measurement.SamplePeriodTimeOffset = req.SamplePeriodTimeOffset
	cmd.Measurement.SamplePeriod = req.SamplePeriod
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.measurementRepo.Save(context.TODO(), &cmd.Measurement); err != nil {
			return err
		}
		if periodIsChanged {
			err := cmd.updateSensorSettings(txCtx, cmd.SensorSettings, req.SamplePeriod)
			if err != nil {
				return err
			}
			job := crontask.NewMeasurementDataJob(cmd.Measurement)
			adapter.CronTask.RefreshJob(job)
		}
		return nil
	})
	return err
}

func (cmd MeasurementUpdateCmd) UpdateDeviceBindings(req request.UpdateMeasurementDeviceBindings) error {
	bindings := make([]po.MeasurementDeviceBinding, len(req.BindingDevices))
	for i, binding := range req.BindingDevices {
		bindings[i] = po.MeasurementDeviceBinding{
			MeasurementID: cmd.Measurement.ID,
			MacAddress:    binding.Value,
			Index:         binding.Index,
		}
	}
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		for i, binding := range bindings {
			if device, err := cmd.deviceRepo.GetBySpecs(txCtx, spec.DeviceMacEqSpec(binding.MacAddress)); err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
				device.SetSensors(po.SensorSetting{"schedule0_sample_period": cmd.Measurement.SamplePeriod})
				device.MacAddress = binding.MacAddress
				device.AssetID = cmd.Measurement.AssetID
				device.Type = req.DeviceType
				device.Category = 3
				device.Name = fmt.Sprintf("%s-%d", cmd.Measurement.Name, i)
				if err := cmd.deviceRepo.Save(txCtx, &device.Device); err != nil {
					return err
				}
			}
		}
		return cmd.bindingRepo.BatchCreate(txCtx, bindings...)
	})
	return err
}

func (cmd MeasurementUpdateCmd) UpdateSettings(req request.MeasurementSettings) error {
	return nil
}

func (cmd MeasurementUpdateCmd) updateSensorSettings(ctx context.Context, e po.SensorSetting, period uint) error {
	if e == nil {
		e = po.SensorSetting{
			"schedule0_sample_period": period,
		}
	}
	bindings, err := cmd.bindingRepo.FindBySpecs(ctx, spec.MeasurementEqSpec(cmd.Measurement.ID))
	if err != nil {
		return err
	}
	if len(bindings) > 0 {
		macSpec := make(spec.DeviceMacInSpec, len(bindings))
		for i, binding := range bindings {
			macSpec[i] = binding.MacAddress
		}
		updates := map[string]interface{}{
			"sensors": e,
		}
		if err := cmd.deviceRepo.UpdatesBySpecs(ctx, updates, macSpec); err != nil {
			return err
		}
		// sync device settings
		devices, err := cmd.deviceRepo.FindBySpecs(ctx, macSpec)
		if err != nil {
			return err
		}
		go cmd.syncDeviceSettings(devices)
	}
	return nil
}

func (cmd MeasurementUpdateCmd) syncDeviceSettings(devices []entity.Device) {
	ctx := context.TODO()
	if len(devices) > 0 {
		if devices[0].NetworkID > 0 {
			network, err := cmd.networkRepo.Get(ctx, devices[0].NetworkID)
			if err != nil {
				xlog.Error("sync device settings failed", err)
				return
			}
			gateway, err := cmd.deviceRepo.Get(ctx, network.GatewayID)
			if err != nil {
				xlog.Error("sync device settings failed", err)
				return
			}
			for i := range devices {
				device := devices[i]
				go command.SyncDeviceSettings(gateway, device)
			}
		} else {
			xlog.Warnf("sync device settings failed, device [%s] has no network", devices[0].MacAddress)
		}
	}
}
