package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type EventRepository interface {
	Create(ctx context.Context, e *entity.Event) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Event, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Event, int64, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
