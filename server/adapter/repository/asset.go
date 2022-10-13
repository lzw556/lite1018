package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Asset struct {
	repository
}

var _ dependency.AssetRepository = &Asset{}

func (repo Asset) Create(ctx context.Context, e *entity.Asset) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Asset) Save(ctx context.Context, e *entity.Asset) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Asset) Get(ctx context.Context, id uint) (entity.Asset, error) {
	var e entity.Asset

	if err := repo.DB(ctx).First(&e, id).Error; err != nil {
		return entity.Asset{}, err
	}

	return e, nil
}

func (repo Asset) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Asset{}, id).Error
}

func (repo Asset) GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Asset, error) {
	var e entity.Asset
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Asset) PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.Assets, int64, error) {
	db := repo.DB(ctx).Model(&entity.Asset{}).Scopes(specification.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Asset
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Asset) FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Assets, error) {
	var es []entity.Asset
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo Asset) DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error {
	return repo.DB(ctx).Scopes(specification.Scopes(specs)...).Delete(&entity.Asset{}).Error
}
