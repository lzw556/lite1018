package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointRemoveCmd struct {
	entity.MonitoringPoint

	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewMonitoringPointRemoveCmd() MonitoringPointRemoveCmd {
	return MonitoringPointRemoveCmd{
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (cmd MonitoringPointRemoveCmd) Run() error {
	ctx := context.TODO()
	return cmd.monitoringPointRepo.Delete(ctx, cmd.MonitoringPoint.ID)
}
