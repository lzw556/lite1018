package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleGroupCreateCmd struct {
	entity.AlarmRuleGroup

	RuleCreateCmds []AlarmRuleCreateCmd

	alarmRuleGroupRepo dependency.AlarmRuleGroupRepository
	// alarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
}

func NewAlarmRuleGroupCreateCmd() AlarmRuleGroupCreateCmd {
	return AlarmRuleGroupCreateCmd{
		alarmRuleGroupRepo: repository.AlarmRuleGroup{},
		// alarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
	}
}

func (cmd AlarmRuleGroupCreateCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRuleGroupRepo.Create(txCtx, &cmd.AlarmRuleGroup); err != nil {
			return err
		}

		for _, ruleCreateCmd := range cmd.RuleCreateCmds {
			if err := ruleCreateCmd.RunWithContext(txCtx); err != nil {
				return err
			}
		}

		return nil
	})
}
