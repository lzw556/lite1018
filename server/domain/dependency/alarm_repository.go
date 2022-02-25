package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleRepository interface {
	Get(ctx context.Context, id uint) (entity.AlarmRule, error)
	Paging(ctx context.Context, page, size int) ([]entity.AlarmRule, int64, error)
	Save(ctx context.Context, e *entity.AlarmRule) error
	Delete(ctx context.Context, id uint) error
	Create(ctx context.Context, e *entity.AlarmRule) error

	PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]entity.AlarmRule, int64, error)
	FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.AlarmRule, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRule, error)
}
