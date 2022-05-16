package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type PermissionRepository interface {
	Create(ctx context.Context, e *entity.Permission) error
	Save(ctx context.Context, e *entity.Permission) error
	Delete(ctx context.Context, id uint) error
	Paging(ctx context.Context, page, size int) ([]entity.Permission, int64, error)
	Find(ctx context.Context) ([]entity.Permission, error)

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Permission, error)
}
