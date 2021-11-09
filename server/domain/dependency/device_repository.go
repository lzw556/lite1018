package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type DeviceRepository interface {
	Create(ctx context.Context, e *po.Device) error

	Delete(ctx context.Context, id uint) error
	DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error

	Save(ctx context.Context, e *po.Device) error
	UpdatesBySpecs(ctx context.Context, updates map[string]interface{}, specs ...specification.Specification) error

	Get(ctx context.Context, id uint) (entity.Device, error)
	Find(ctx context.Context, ids ...uint) ([]entity.Device, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Device, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.Device, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]entity.Device, int64, error)
}
