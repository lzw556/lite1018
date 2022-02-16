package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmTemplateRepository interface {
	Create(ctx context.Context, e *entity.AlarmTemplate) error
	Get(ctx context.Context, id uint) (entity.AlarmTemplate, error)
	Save(ctx context.Context, e *entity.AlarmTemplate) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]entity.AlarmTemplate, int64, error)
}
