package dependency

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleGroupRepository interface {
	Create(ctx context.Context, e *entity.AlarmRuleGroup) error
	Save(ctx context.Context, e *entity.AlarmRuleGroup) error
	Get(ctx context.Context, id uint) (entity.AlarmRuleGroup, error)
	Delete(ctx context.Context, id uint) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.AlarmRuleGroups, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroups, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroup, error)
	DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error
}
