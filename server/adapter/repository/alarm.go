package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Alarm struct {
	repository
}

func (repo Alarm) Save(ctx context.Context, e *entity.Alarm) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Alarm) Get(ctx context.Context, id uint) (entity.Alarm, error) {
	var e entity.Alarm
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Alarm) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Alarm{}, id).Error
}

func (repo Alarm) Paging(ctx context.Context, page, size int) ([]entity.Alarm, int64, error) {
	db := repo.DB(ctx).Model(&entity.Alarm{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Alarm
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Alarm) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Alarm, int64, error) {
	db := repo.DB(ctx).Model(&entity.Alarm{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Alarm
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Alarm) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Alarm, error) {
	var es []entity.Alarm
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo Alarm) BatchCreate(ctx context.Context, es entity.Alarms) error {
	return repo.DB(ctx).Create(&es).Error
}
