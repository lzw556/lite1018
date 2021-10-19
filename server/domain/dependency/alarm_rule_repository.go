package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleRepository interface {
	Get(ctx context.Context, id uint) (po.AlarmRule, error)
	Paging(ctx context.Context, page, size int) ([]po.AlarmRule, int64, error)
	Save(ctx context.Context, e *po.AlarmRule) error
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]po.AlarmRule, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]po.AlarmRule, error)
	BatchCreate(ctx context.Context, es po.AlarmRules) error
}
