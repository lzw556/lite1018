package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type PermissionRepository interface {
	Create(ctx context.Context, e *po.Permission) error
	Save(ctx context.Context, e *po.Permission) error
	Delete(ctx context.Context, id uint) error
	Paging(ctx context.Context, page, size int) ([]po.Permission, int64, error)
	Find(ctx context.Context) ([]po.Permission, error)

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Permission, error)
}
