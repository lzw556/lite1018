package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleCreateCmd struct {
	entity.AlarmRule
	AlarmSources []entity.AlarmSource

	alarmRuleRepo   dependency.AlarmRuleRepository
	alarmSourceRepo dependency.AlarmSourceRepository
}

func NewAlarmRuleCreateCmd() AlarmRuleCreateCmd {
	return AlarmRuleCreateCmd{
		alarmRuleRepo:   repository.AlarmRule{},
		alarmSourceRepo: repository.AlarmSource{},
	}
}

func (cmd AlarmRuleCreateCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRuleRepo.Create(txCtx, &cmd.AlarmRule); err != nil {
			return err
		}
		if len(cmd.AlarmSources) > 0 {
			for i := range cmd.AlarmSources {
				cmd.AlarmSources[i].AlarmRuleID = cmd.AlarmRule.ID
			}
			if err := cmd.alarmSourceRepo.Create(txCtx, cmd.AlarmSources...); err != nil {
				return err
			}
		}
		return ruleengine.UpdateRules(cmd.AlarmRule)
	})
}

func (cmd AlarmRuleCreateCmd) RunWithContext(ctx context.Context) error {
	if err := cmd.alarmRuleRepo.Create(ctx, &cmd.AlarmRule); err != nil {
		return err
	}
	if len(cmd.AlarmSources) > 0 {
		for i := range cmd.AlarmSources {
			cmd.AlarmSources[i].AlarmRuleID = cmd.AlarmRule.ID
		}
		if err := cmd.alarmSourceRepo.Create(ctx, cmd.AlarmSources...); err != nil {
			return err
		}
	}
	return ruleengine.UpdateRules(cmd.AlarmRule)
}
