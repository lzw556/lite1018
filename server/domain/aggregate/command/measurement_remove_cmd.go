package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"strconv"
	"time"
)

type MeasurementRemoveCmd struct {
	po.Measurement

	measurementRepo     dependency.MeasurementRepository
	measurementDataRepo dependency.MeasurementDataRepository
	bindingRepo         dependency.MeasurementDeviceBindingRepository
}

func NewMeasurementRemoveCmd() MeasurementRemoveCmd {
	return MeasurementRemoveCmd{
		measurementRepo:     repository.Measurement{},
		measurementDataRepo: repository.MeasurementData{},
		bindingRepo:         repository.MeasurementDeviceBinding{},
	}
}

func (cmd MeasurementRemoveCmd) Remove() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.measurementRepo.Delete(txCtx, cmd.Measurement.ID); err != nil {
			return err
		}
		if err := cmd.bindingRepo.DeleteBySpecs(txCtx, spec.MeasurementEqSpec(cmd.Measurement.ID)); err != nil {
			return err
		}
		if cmd.Measurement.Mode == po.PollingAcquisitionMode {
			adapter.CronTask.RemoveJob(strconv.Itoa(int(cmd.Measurement.ID)))
		}
		return nil
	})
}

func (cmd MeasurementRemoveCmd) RemoveData(from, to int64) error {
	return cmd.measurementDataRepo.Delete(cmd.Measurement.ID, time.Unix(from, 0), time.Unix(to, 0))
}
