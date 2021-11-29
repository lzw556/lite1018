package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleMenuRelationRepository interface {
	BatchCreate(ctx context.Context, es []po.RoleMenuRelation) error
	Create(ctx context.Context, e *po.RoleMenuRelation) error
	Delete(ctx context.Context, id int64) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.RoleMenuRelation, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
