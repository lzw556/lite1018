package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmSourceRepository interface {
	Create(ctx context.Context, es ...entity.AlarmSource) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.AlarmSource, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
