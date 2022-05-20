package dependency

import (
  "context"

  "github.com/thetasensors/theta-cloud-lite/server/domain/entity"
  "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleGroupSourceRepository interface {
  Create(ctx context.Context, e *entity.AlarmRuleGroupSource) error
  Save(ctx context.Context, e *entity.AlarmRuleGroupSource) error
  Get(ctx context.Context, id uint) (entity.AlarmRuleGroupSource, error)
  Delete(ctx context.Context, id uint) error

  PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.AlarmRuleGroupSources, int64, error)
  FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroupSources, error)
  GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroupSource, error)
}
