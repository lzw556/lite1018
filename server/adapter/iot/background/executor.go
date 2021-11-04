package background

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Executor interface {
	Execute(ctx context.Context, gateway, device entity.Device) error
}
