package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AssetRepository interface {
	Get(ctx context.Context, id uint) (po.Asset, error)
	Find(ctx context.Context) ([]po.Asset, error)
	FindByPaginate(ctx context.Context, page int, size int) ([]po.Asset, int64, error)
	Create(ctx context.Context, e *po.Asset) error
	Save(ctx context.Context, e *po.Asset) error
	Delete(ctx context.Context, id uint) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Asset, error)
}
