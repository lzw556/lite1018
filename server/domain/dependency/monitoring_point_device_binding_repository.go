package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDeviceBindingRepository interface {
	Create(ctx context.Context, e *entity.MonitoringPointDeviceBinding) error
}
