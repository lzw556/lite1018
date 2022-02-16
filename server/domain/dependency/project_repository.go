package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type ProjectRepository interface {
	Create(ctx context.Context, e *entity.Project) error
	Save(ctx context.Context, e *entity.Project) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (entity.Project, error)

	GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Project, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Project, int64, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Project, error)
}
