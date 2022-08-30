package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointUpdateCmd struct {
	entity.MonitoringPoint

	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewMonitoringPointUpdateCmd() MonitoringPointUpdateCmd {
	return MonitoringPointUpdateCmd{
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (cmd MonitoringPointUpdateCmd) Run() error {
	ctx := context.TODO()
	var err error
	if err = cmd.monitoringPointRepo.Save(ctx, &cmd.MonitoringPoint); err != nil {
		return err
	}

	return err
}
