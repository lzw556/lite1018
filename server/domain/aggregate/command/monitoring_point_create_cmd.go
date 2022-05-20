package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointCreateCmd struct {
	entity.MonitoringPoint

	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewMonitoringPointCreateCmd() MonitoringPointCreateCmd {
	return MonitoringPointCreateCmd{
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (cmd MonitoringPointCreateCmd) Run() (entity.MonitoringPoint, error) {
	ctx := context.TODO()
	if err := cmd.monitoringPointRepo.Create(ctx, &cmd.MonitoringPoint); err != nil {
		return entity.MonitoringPoint{}, err
	}

	return cmd.MonitoringPoint, nil
}
