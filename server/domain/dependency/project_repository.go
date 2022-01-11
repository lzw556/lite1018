package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type ProjectRepository interface {
	Create(ctx context.Context, e *po.Project) error
	Save(ctx context.Context, e *po.Project) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (po.Project, error)

	GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.Project, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.Project, int64, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Project, error)
}
