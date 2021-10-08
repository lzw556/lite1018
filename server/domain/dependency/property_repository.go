package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type PropertyRepository interface {
	FindByDeviceTypeID(ctx context.Context, typeID uint) ([]po.Property, error)
	Get(ctx context.Context, id uint) (po.Property, error)
}
