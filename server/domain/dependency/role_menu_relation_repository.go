package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleMenuRelationRepository interface {
	BatchCreate(ctx context.Context, es []entity.RoleMenuRelation) error
	Create(ctx context.Context, e *entity.RoleMenuRelation) error
	Delete(ctx context.Context, id int64) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.RoleMenuRelation, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
