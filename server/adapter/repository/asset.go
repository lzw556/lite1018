package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Asset struct {
	repository
}

func (repo Asset) Get(ctx context.Context, id uint) (po.Asset, error) {
	var e po.Asset
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Asset) Find(ctx context.Context) ([]po.Asset, error) {
	var es []po.Asset
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Asset) PagingBySpecs(ctx context.Context, page int, size int, specs ...spec.Specification) ([]po.Asset, int64, error) {
	db := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Model(&po.Asset{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.Asset
	if err := db.Scopes(repo.paginate(page, size)).Find(&es).Error; err != nil {
		return nil, 0, err
	}
	return es, total, nil
}

func (repo Asset) Create(ctx context.Context, e *po.Asset) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Asset) Save(ctx context.Context, e *po.Asset) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Asset) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Asset{}, id).Error
}

func (repo Asset) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Asset, error) {
	var es []po.Asset
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
