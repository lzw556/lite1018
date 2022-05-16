package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleRepository interface {
	Create(ctx context.Context, e *entity.Role) error
	Save(ctx context.Context, e *entity.Role) error
	Paging(ctx context.Context, page, size int) ([]entity.Role, int64, error)
	Get(ctx context.Context, id uint) (entity.Role, error)
	Delete(ctx context.Context, id uint) error

	GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Role, error)
}
