package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MenuRepository interface {
	Find(ctx context.Context) ([]entity.Menu, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Menu, error)
}
