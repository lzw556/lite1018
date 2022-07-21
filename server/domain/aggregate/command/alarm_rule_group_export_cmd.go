package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleGroupExportCmd struct {
	entity.Project

	alarmRuleRepo            dependency.AlarmRuleRepository
	alarmRuleGroupRepo       dependency.AlarmRuleGroupRepository
	alarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
}

func NewAlarmRuleGroupExportCmd() AlarmRuleGroupExportCmd {
	return AlarmRuleGroupExportCmd{
		alarmRuleRepo:            repository.AlarmRule{},
		alarmRuleGroupRepo:       repository.AlarmRuleGroup{},
		alarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
	}
}

func (cmd AlarmRuleGroupExportCmd) Run() (*vo.AlarmRuleGroupsExported, error) {
	result := vo.AlarmRuleGroupsExported{
		ProjectID:       cmd.Project.ID,
		ProjectName:     cmd.Project.Name,
		AlarmRuleGroups: make([]*vo.AlarmRuleGroupExported, 0),
	}

	groups, err := cmd.alarmRuleGroupRepo.FindBySpecs(context.TODO(), spec.ProjectEqSpec(cmd.Project.ID))
	if err != nil {
		return nil, err
	}

	for _, group := range groups {
		q := query.NewAlarmRuleGroupQuery()
		voGroup, err := q.Get(group.ID)
		if err == nil {
			ge := vo.AlarmRuleGroupExported{
				ID:          voGroup.ID,
				Name:        voGroup.Name,
				Description: voGroup.Description,
				Category:    voGroup.Category,
				Type:        voGroup.Type,
				Rules:       voGroup.Rules,
			}

			result.AlarmRuleGroups = append(result.AlarmRuleGroups, &ge)
		}
	}

	return &result, nil
}
