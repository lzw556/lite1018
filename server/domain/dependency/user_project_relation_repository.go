package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserProjectRelationRepository interface {
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.UserProjectRelation, error)
	BatchCreate(ctx context.Context, es []po.UserProjectRelation) error
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
