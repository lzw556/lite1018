package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmTemplateRepository interface {
	Create(ctx context.Context, e *po.AlarmTemplate) error
	Get(ctx context.Context, id uint) (po.AlarmTemplate, error)
	Save(ctx context.Context, e *po.AlarmTemplate) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]po.AlarmTemplate, int64, error)
}
