package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleGroupRemoveCmd struct {
	entity.AlarmRuleGroup

	alarmRuleRepo            dependency.AlarmRuleRepository
	alarmSourceRepo          dependency.AlarmSourceRepository
	alarmRuleGroupRepo       dependency.AlarmRuleGroupRepository
	alarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
}

func NewAlarmRuleGroupRemoveCmd() AlarmRuleGroupRemoveCmd {
	return AlarmRuleGroupRemoveCmd{
		alarmRuleGroupRepo:       repository.AlarmRuleGroup{},
		alarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
	}
}

func (cmd AlarmRuleGroupRemoveCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		sources, err := cmd.alarmRuleGroupSourceRepo.FindBySpecs(txCtx, spec.GroupIdEqSpec(cmd.AlarmRuleGroup.ID))
		if err != nil {
			return err
		}

		for _, s := range sources {
			alarmRule, err := cmd.alarmRuleRepo.Get(txCtx, s.AlarmRuleID)
			if err != nil {
				return err
			}

			if err := cmd.alarmRuleRepo.Delete(txCtx, s.AlarmRuleID); err != nil {
				return err
			}

			if err := cmd.alarmSourceRepo.DeleteBySpecs(txCtx, spec.AlarmRuleEqSpec(s.AlarmRuleID)); err != nil {
				return err
			}

			if err := ruleengine.RemoveRules(alarmRule.Name); err != nil {
				return err
			}

			if err := cmd.alarmRuleGroupSourceRepo.Delete(txCtx, s.ID); err != nil {
				return err
			}
		}

		return cmd.alarmRuleGroupRepo.Delete(txCtx, cmd.AlarmRuleGroup.ID)
	})
}
