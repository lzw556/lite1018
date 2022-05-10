package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
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
