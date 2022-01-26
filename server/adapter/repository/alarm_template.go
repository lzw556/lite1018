package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmTemplate struct {
	repository
}

func (repo AlarmTemplate) Create(ctx context.Context, e *po.AlarmTemplate) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmTemplate) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.AlarmTemplate, int64, error) {
	db := repo.DB(ctx).Model(&po.AlarmTemplate{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.AlarmTemplate
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmTemplate) Get(ctx context.Context, id uint) (po.AlarmTemplate, error) {
	var e po.AlarmTemplate
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo AlarmTemplate) Save(ctx context.Context, e *po.AlarmTemplate) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmTemplate) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.AlarmTemplate{}, id).Error
}
