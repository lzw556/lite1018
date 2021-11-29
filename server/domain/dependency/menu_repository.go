package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MenuRepository interface {
	Find(ctx context.Context) ([]po.Menu, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Menu, error)
}
