package query

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleGroupQuery struct {
	Specs spec.Specifications

	alarmRuleGroupRepo       dependency.AlarmRuleGroupRepository
	alarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
}

func NewAlarmRuleGroupQuery() AlarmRuleGroupQuery {
	return AlarmRuleGroupQuery{
		alarmRuleGroupRepo:       repository.AlarmRuleGroup{},
		alarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
	}
}

func (query AlarmRuleGroupQuery) Get(id uint) (*vo.AlarmRuleGroup, error) {
	ctx := context.TODO()
	result := vo.AlarmRuleGroup{}
	e, err := query.alarmRuleGroupRepo.Get(ctx, id)
	if err != nil {
		return &result, err
	}

	result = vo.NewAlarmRuleGroup(e)

	bindings, err := query.alarmRuleGroupSourceRepo.FindBySpecs(ctx, spec.GroupIDEqSpec(id))
	if err != nil {
		return &result, err
	}

	ruleQuery := NewAlarmRuleQuery()
	for _, binding := range bindings {
		r, err := ruleQuery.Get(binding.AlarmRuleID)

		if err != nil {
			return &result, err
		}

		result.Rules = append(result.Rules, r)
	}

	return &result, nil
}

func (query AlarmRuleGroupQuery) List() ([]vo.AlarmRuleGroup, error) {
	groups, err := query.alarmRuleGroupRepo.FindBySpecs(context.TODO(), query.Specs...)
	if err != nil {
		return []vo.AlarmRuleGroup{}, err
	}

	result := make([]vo.AlarmRuleGroup, len(groups))
	for i, group := range groups {
		g, err := query.Get(group.ID)
		if err != nil {
			return []vo.AlarmRuleGroup{}, err
		}

		result[i] = *g
	}

	return result, nil
}
