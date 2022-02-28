package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleUpdateCmd struct {
	entity.AlarmRule

	alarmRuleRepo dependency.AlarmRuleRepository
}

func NewAlarmRuleUpdateCmd() AlarmRuleUpdateCmd {
	return AlarmRuleUpdateCmd{
		alarmRuleRepo: repository.AlarmRule{},
	}
}

func (cmd AlarmRuleUpdateCmd) Update(req request.AlarmRule) error {
	cmd.AlarmRule.Description = req.Description
	cmd.Operation = req.Operation
	cmd.Level = req.Level
	cmd.Threshold = req.Threshold
	cmd.Duration = req.Duration
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRuleRepo.Save(txCtx, &cmd.AlarmRule); err != nil {
			return err
		}
		return ruleengine.UpdateRules(cmd.AlarmRule)
	})
}

func (cmd AlarmRuleUpdateCmd) UpdateStatus(status uint8) error {
	cmd.AlarmRule.Status = status
	return cmd.alarmRuleRepo.Save(context.TODO(), &cmd.AlarmRule)
}
