package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceLinkStatusRepository interface {
	Create(ctx context.Context, e *entity.DeviceLinkStatus) error
}
