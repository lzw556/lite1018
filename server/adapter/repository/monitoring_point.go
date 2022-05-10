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

func (repo MonitoringPoint) Save(ctx context.Context, e *entity.MonitoringPoint) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo MonitoringPoint) Get(ctx context.Context, id uint) (entity.MonitoringPoint, error) {
	var e entity.MonitoringPoint

	if err := repo.DB(ctx).First(&e, id).Error; err != nil {
		return entity.MonitoringPoint{}, err
	}

	return e, nil
}

func (repo MonitoringPoint) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.MonitoringPoint{}, id).Error
}
