package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AssetRepository interface {
	Create(ctx context.Context, e *entity.Asset) error
}
