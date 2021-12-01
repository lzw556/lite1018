package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleRepository interface {
	Create(ctx context.Context, e *po.Role) error
	Save(ctx context.Context, e *po.Role) error
	Paging(ctx context.Context, page, size int) ([]po.Role, int64, error)
	Get(ctx context.Context, id uint) (po.Role, error)
	Delete(ctx context.Context, id uint) error

	GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.Role, error)
}
