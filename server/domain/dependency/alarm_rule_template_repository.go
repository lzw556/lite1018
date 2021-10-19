package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleTemplateRepository interface {
	Create(ctx context.Context, e *po.AlarmRuleTemplate) error
	Get(ctx context.Context, id uint) (po.AlarmRuleTemplate, error)
	Save(ctx context.Context, e *po.AlarmRuleTemplate) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]po.AlarmRuleTemplate, int64, error)
}
