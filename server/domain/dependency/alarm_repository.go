package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRepository interface {
	Get(ctx context.Context, id uint) (po.Alarm, error)
	Paging(ctx context.Context, page, size int) ([]po.Alarm, int64, error)
	Save(ctx context.Context, e *po.Alarm) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]po.Alarm, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]po.Alarm, error)
	BatchCreate(ctx context.Context, es po.Alarms) error
}
