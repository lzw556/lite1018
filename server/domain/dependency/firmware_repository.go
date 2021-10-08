package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type FirmwareRepository interface {
	Create(ctx context.Context, e *po.Firmware) error

	Get(ctx context.Context, id uint) (po.Firmware, error)
	FindByPaginate(ctx context.Context, page, size int) ([]po.Firmware, int64, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (po.Firmware, error)

	Delete(ctx context.Context, id uint) error
}
