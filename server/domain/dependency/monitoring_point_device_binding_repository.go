package dependency

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MonitoringPointDeviceBindingRepository interface {
	Create(ctx context.Context, e *entity.MonitoringPointDeviceBinding) error
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.MonitoringPointDeviceBinding, error)
}
