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

type AlarmRuleDeleteCmd struct {
	entity.AlarmRule

	alarmRuleRepo   dependency.AlarmRuleRepository
	alarmSourceRepo dependency.AlarmSourceRepository
}

func NewAlarmRuleDeleteCmd() AlarmRuleDeleteCmd {
	return AlarmRuleDeleteCmd{
		alarmRuleRepo:   repository.AlarmRule{},
		alarmSourceRepo: repository.AlarmSource{},
	}
}

func (cmd AlarmRuleDeleteCmd) Delete() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRuleRepo.Delete(txCtx, cmd.AlarmRule.ID); err != nil {
			return err
		}
		if err := cmd.alarmSourceRepo.DeleteBySpecs(txCtx, spec.AlarmRuleEqSpec(cmd.AlarmRule.ID)); err != nil {
			return err
		}
		return ruleengine.RemoveRules(cmd.AlarmRule.Name)
	})
}
