package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserRepository interface {
	Get(ctx context.Context, id uint) (entity.User, error)
	GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.User, error)
	Paging(ctx context.Context, page, size int) ([]entity.User, int64, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.User, error)

	Create(ctx context.Context, e *entity.User) error

	Save(ctx context.Context, e *entity.User) error
	Updates(ctx context.Context, e *entity.User, updates map[string]interface{}) error
	UpdatesBySpecs(ctx context.Context, updates map[string]interface{}, specs ...spec.Specification) error

	Delete(ctx context.Context, id uint) error
}
