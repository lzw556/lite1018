package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MeasurementRepository interface {
	Create(ctx context.Context, e *po.Measurement) error
	Get(ctx context.Context, id uint) (po.Measurement, error)
	Find(ctx context.Context) ([]po.Measurement, error)
	Save(ctx context.Context, e *po.Measurement) error
	Delete(ctx context.Context, id uint) error

	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Measurement, error)
}
