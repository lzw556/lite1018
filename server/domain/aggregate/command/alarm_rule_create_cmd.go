package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleCreateCmd struct {
	po.AlarmRules

	alarmRuleRepo dependency.AlarmRuleRepository
}

func NewAlarmRuleCreateCmd() AlarmRuleCreateCmd {
	return AlarmRuleCreateCmd{
		alarmRuleRepo: repository.AlarmRule{},
	}
}

func (cmd AlarmRuleCreateCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRuleRepo.BatchCreate(context.TODO(), cmd.AlarmRules); err != nil {
			return err
		}
		return ruleengine.UpdateRules(cmd.AlarmRules...)
	})
}
