package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointRepository interface {
	Create(ctx context.Context, e *entity.MonitoringPoint) error
	Save(ctx context.Context, e *entity.MonitoringPoint) error
	Get(ctx context.Context, id uint) (entity.MonitoringPoint, error)
	Delete(ctx context.Context, id uint) error
}
