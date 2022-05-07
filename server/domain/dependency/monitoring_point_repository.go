package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointRepository interface {
	Create(ctx context.Context, e *entity.MonitoringPoint) error
}
