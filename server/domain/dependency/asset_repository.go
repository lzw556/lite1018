package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AssetRepository interface {
	Create(ctx context.Context, e *entity.Asset) error
	Save(ctx context.Context, e *entity.Asset) error
	Get(ctx context.Context, id uint) (entity.Asset, error)
	Delete(ctx context.Context, id uint) error
}
