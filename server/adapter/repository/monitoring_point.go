package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
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

func (repo MonitoringPoint) GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.MonitoringPoint, error) {
	var e entity.MonitoringPoint
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo MonitoringPoint) PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.MonitoringPoints, int64, error) {
	db := repo.DB(ctx).Model(&entity.MonitoringPoint{}).Scopes(specification.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.MonitoringPoint
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo MonitoringPoint) FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.MonitoringPoints, error) {
	var es []entity.MonitoringPoint
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo MonitoringPoint) DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error {
	return repo.DB(ctx).Scopes(specification.Scopes(specs)...).Delete(&entity.MonitoringPoint{}).Error
}
