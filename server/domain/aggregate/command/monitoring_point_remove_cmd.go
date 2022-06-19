package command

import (
	"context"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type MonitoringPointRemoveCmd struct {
	entity.MonitoringPoint

	monitoringPointRepo              dependency.MonitoringPointRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
	monitoringPointDataRepo          dependency.MonitoringPointDataRepository
}

func NewMonitoringPointRemoveCmd() MonitoringPointRemoveCmd {
	return MonitoringPointRemoveCmd{
		monitoringPointRepo:              repository.MonitoringPoint{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
		monitoringPointDataRepo:          repository.MonitoringPointData{},
	}
}

func (cmd MonitoringPointRemoveCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.monitoringPointDeviceBindingRepo.DeleteBySpecs(txCtx, spec.MonitoringPointIDEqSpec(cmd.MonitoringPoint.ID)); err != nil {
			return err
		}

		return cmd.monitoringPointRepo.Delete(txCtx, cmd.MonitoringPoint.ID)
	})
}

func (cmd MonitoringPointRemoveCmd) RemoveData(category uint, from time.Time, to time.Time) error {
	return cmd.monitoringPointDataRepo.Delete(cmd.MonitoringPoint.ID, category, from, to)
}
