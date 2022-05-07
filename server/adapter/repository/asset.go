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
