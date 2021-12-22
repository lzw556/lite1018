package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Alarm struct {
	repository
}

func (repo Alarm) Save(ctx context.Context, e *po.Alarm) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Alarm) Get(ctx context.Context, id uint) (po.Alarm, error) {
	var e po.Alarm
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Alarm) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Alarm{}, id).Error
}

func (repo Alarm) Paging(ctx context.Context, page, size int) ([]po.Alarm, int64, error) {
	db := repo.DB(ctx).Model(&po.Alarm{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.Alarm
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Alarm) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.Alarm, int64, error) {
	db := repo.DB(ctx).Model(&po.Alarm{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.Alarm
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Alarm) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Alarm, error) {
	var es []po.Alarm
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo Alarm) BatchCreate(ctx context.Context, es po.Alarms) error {
	return repo.DB(ctx).Create(&es).Error
}
