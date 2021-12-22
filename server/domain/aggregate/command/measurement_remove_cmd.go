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
)

type MeasurementRemoveCmd struct {
	po.Measurement

	measurementRepo dependency.MeasurementRepository
	bindingRepo     dependency.MeasurementDeviceBindingRepository
}

func NewMeasurementRemoveCmd() MeasurementRemoveCmd {
	return MeasurementRemoveCmd{
		measurementRepo: repository.Measurement{},
		bindingRepo:     repository.MeasurementDeviceBinding{},
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
		adapter.CronTask.RemoveJob(strconv.Itoa(int(cmd.Measurement.ID)))
		return nil
	})
}
