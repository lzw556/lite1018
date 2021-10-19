package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRule struct {
	repository
}

func (repo AlarmRule) Save(ctx context.Context, e *po.AlarmRule) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmRule) Get(ctx context.Context, id uint) (po.AlarmRule, error) {
	var e po.AlarmRule
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo AlarmRule) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.AlarmRule{}, id).Error
}

func (repo AlarmRule) Paging(ctx context.Context, page, size int) ([]po.AlarmRule, int64, error) {
	db := repo.DB(ctx).Model(&po.AlarmRule{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.AlarmRule
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRule) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.AlarmRule, int64, error) {
	db := repo.DB(ctx).Model(&po.AlarmRule{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.AlarmRule
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRule) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.AlarmRule, error) {
	var es []po.AlarmRule
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmRule) BatchCreate(ctx context.Context, es po.AlarmRules) error {
	return repo.DB(ctx).Create(&es).Error
}
