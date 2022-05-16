package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserProjectRelationRepository interface {
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.UserProjectRelation, error)
	BatchCreate(ctx context.Context, es []entity.UserProjectRelation) error
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
