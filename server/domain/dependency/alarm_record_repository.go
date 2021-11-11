package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordRepository interface {
	Create(ctx context.Context, e *po.AlarmRecord) error
	Get(ctx context.Context, id uint) (po.AlarmRecord, error)
	PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.AlarmRecord, int64, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.AlarmRecord, error)
}
