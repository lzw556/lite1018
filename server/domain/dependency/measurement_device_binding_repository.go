package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MeasurementDeviceBindingRepository interface {
	BatchCreate(ctx context.Context, es ...po.MeasurementDeviceBinding) error
	GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.MeasurementDeviceBinding, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) (po.MeasurementDeviceBindings, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
