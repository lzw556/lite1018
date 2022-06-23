package query

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleGroupQuery struct {
	Specs              spec.Specifications
	MonitoringPointIDs []uint

	alarmRuleGroupRepo       dependency.AlarmRuleGroupRepository
	alarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
	alarmSourceRepo          dependency.AlarmSourceRepository
}

func NewAlarmRuleGroupQuery() AlarmRuleGroupQuery {
	return AlarmRuleGroupQuery{
		alarmRuleGroupRepo:       repository.AlarmRuleGroup{},
		alarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
		alarmSourceRepo:          repository.AlarmSource{},

		MonitoringPointIDs: make([]uint, 0),
	}
}

func (query AlarmRuleGroupQuery) Get(id uint) (*vo.AlarmRuleGroup, error) {
	ctx := context.TODO()
	e, err := query.alarmRuleGroupRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	result := vo.NewAlarmRuleGroup(e)

	bindings, err := query.alarmRuleGroupSourceRepo.FindBySpecs(ctx, spec.GroupIDEqSpec(id))
	if err != nil {
		return &result, err
	}

	ruleQuery := NewAlarmRuleQuery()
	for i, binding := range bindings {
		r, err := ruleQuery.Get(binding.AlarmRuleID)

		if err != nil {
			return &result, err
		}

		result.Rules = append(result.Rules, r)

		if result.Category == uint(entity.AlarmRuleCategoryMonitoringPoint) && i == 0 {
			alarmRuleSources, err := query.alarmSourceRepo.FindBySpecs(ctx, spec.AlarmRuleEqSpec(binding.AlarmRuleID))
			if err != nil {
				return &result, err
			}

			for _, ruleSource := range alarmRuleSources {
				mpQuery := NewMonitoringPointQuery()
				mp, err := mpQuery.Get(ruleSource.SourceID)
				if err != nil {
					return &result, err
				}
				result.MonitoringPoints = append(result.MonitoringPoints, &mp)
			}
		}
	}

	return &result, nil
}

func (query AlarmRuleGroupQuery) List() ([]vo.AlarmRuleGroup, error) {
	ctx := context.TODO()
	groups, err := query.alarmRuleGroupRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return []vo.AlarmRuleGroup{}, err
	}

	result := make([]vo.AlarmRuleGroup, 0)
	for _, group := range groups {
		g, err := query.Get(group.ID)
		if err != nil {
			return []vo.AlarmRuleGroup{}, err
		}

		if len(query.MonitoringPointIDs) > 0 {
			if len(g.Rules) > 0 && g.Category == uint(entity.AlarmRuleCategoryMonitoringPoint) {
				rule := g.Rules[0]

				alarmRuleSources, err := query.alarmSourceRepo.FindBySpecs(ctx, spec.AlarmRuleEqSpec(rule.ID))
				if err != nil {
					return []vo.AlarmRuleGroup{}, err
				}

				for _, mpID := range query.MonitoringPointIDs {
					for _, source := range alarmRuleSources {
						if mpID == source.SourceID {
							result = append(result, *g)
							goto end
						}
					}
				}

			end:
			} else {
				continue
			}

		} else {
			result = append(result, *g)
		}
	}

	return result, nil
}
