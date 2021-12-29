package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/crontask"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type MeasurementCreateCmd struct {
	po.Measurement
	Devices  []entity.Device
	Bindings []po.MeasurementDeviceBinding

	deviceRepo                   dependency.DeviceRepository
	measurementRepo              dependency.MeasurementRepository
	measurementDeviceBindingRepo dependency.MeasurementDeviceBindingRepository
}

func NewMeasurementCreateCmd() MeasurementCreateCmd {
	return MeasurementCreateCmd{
		deviceRepo:                   repository.Device{},
		measurementRepo:              repository.Measurement{},
		measurementDeviceBindingRepo: repository.MeasurementDeviceBinding{},
	}
}

func (cmd MeasurementCreateCmd) Run() (uint, error) {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.measurementRepo.Create(txCtx, &cmd.Measurement); err != nil {
			return err
		}
		for i := range cmd.Bindings {
			cmd.Bindings[i].MeasurementID = cmd.Measurement.ID
		}
		if err := cmd.measurementDeviceBindingRepo.BatchCreate(txCtx, cmd.Bindings...); err != nil {
			return err
		}
		for _, device := range cmd.Devices {
			if device.ID == 0 {
				if err := cmd.deviceRepo.Create(txCtx, &device.Device); err != nil {
					return err
				}
			} else {
				if err := cmd.deviceRepo.Save(txCtx, &device.Device); err != nil {
					return err
				}
			}
		}
		if cmd.Measurement.Mode == po.PollingAcquisitionMode {
			job := crontask.NewMeasurementDataJob(cmd.Measurement)
			adapter.CronTask.AddJobs(job)
		}
		return nil
	})
	return cmd.Measurement.ID, err
}
