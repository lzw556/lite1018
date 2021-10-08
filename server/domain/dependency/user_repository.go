package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserRepository interface {
	Get(ctx context.Context, id uint) (po.User, error)
	GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.User, error)
	Paging(ctx context.Context, page, size int) ([]po.User, int64, error)

	Create(ctx context.Context, e *po.User) error

	Save(ctx context.Context, e *po.User) error
	Updates(ctx context.Context, e *po.User, updates map[string]interface{}) error

	Delete(ctx context.Context, id uint) error
}
