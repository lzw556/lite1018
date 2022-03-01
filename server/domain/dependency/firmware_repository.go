package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type FirmwareRepository interface {
	Create(ctx context.Context, e *entity.Firmware) error

	Get(ctx context.Context, id uint) (entity.Firmware, error)
	Paging(ctx context.Context, page, size int) ([]entity.Firmware, int64, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Firmware, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.Firmware, error)

	Delete(ctx context.Context, id uint) error
}
