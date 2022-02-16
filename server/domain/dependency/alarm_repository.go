package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRepository interface {
	Get(ctx context.Context, id uint) (entity.Alarm, error)
	Paging(ctx context.Context, page, size int) ([]entity.Alarm, int64, error)
	Save(ctx context.Context, e *entity.Alarm) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]entity.Alarm, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.Alarm, error)
	BatchCreate(ctx context.Context, es entity.Alarms) error
}
