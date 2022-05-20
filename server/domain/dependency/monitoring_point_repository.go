package dependency

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MonitoringPointRepository interface {
	Create(ctx context.Context, e *entity.MonitoringPoint) error
	Save(ctx context.Context, e *entity.MonitoringPoint) error
	Get(ctx context.Context, id uint) (entity.MonitoringPoint, error)
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.MonitoringPoints, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.MonitoringPoints, error)
}
