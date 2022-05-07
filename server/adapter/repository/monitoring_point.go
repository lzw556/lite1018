package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPoint struct {
	repository
}

var _ dependency.MonitoringPointRepository = &MonitoringPoint{}

func (repo MonitoringPoint) Create(ctx context.Context, e *entity.MonitoringPoint) error {
	return repo.DB(ctx).Create(e).Error
}
