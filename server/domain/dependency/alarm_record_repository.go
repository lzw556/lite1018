package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordRepository interface {
	Create(ctx context.Context, e *entity.AlarmRecord) error
	Get(ctx context.Context, id uint) (entity.AlarmRecord, error)
	Delete(ctx context.Context, id uint) error
	Save(ctx context.Context, e *entity.AlarmRecord) error
	Updates(ctx context.Context, id uint, updates map[string]interface{}) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.AlarmRecord, int64, error)
	FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.AlarmRecord, error)
	UpdateBySpecs(ctx context.Context, updates map[string]interface{}, specs ...spec.Specification) error
	CountBySpecs(ctx context.Context, specs ...spec.Specification) (int64, error)
	DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error
}
