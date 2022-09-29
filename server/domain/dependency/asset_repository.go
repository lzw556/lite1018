package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AssetRepository interface {
	Create(ctx context.Context, e *entity.Asset) error
	Save(ctx context.Context, e *entity.Asset) error
	Get(ctx context.Context, id uint) (entity.Asset, error)
	Delete(ctx context.Context, id uint) error

	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Asset, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.Assets, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Assets, error)
	DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error
}
