package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleUpdateCmd struct {
	entity.AlarmRule

	alarmRuleRepo   dependency.AlarmRuleRepository
	alarmSourceRepo dependency.AlarmSourceRepository
}

func NewAlarmRuleUpdateCmd() AlarmRuleUpdateCmd {
	return AlarmRuleUpdateCmd{
		alarmRuleRepo:   repository.AlarmRule{},
		alarmSourceRepo: repository.AlarmSource{},
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

func (cmd AlarmRuleUpdateCmd) AddSources(ids []uint) error {
	sources := make([]entity.AlarmSource, len(ids))
	for i, id := range ids {
		sources[i] = entity.AlarmSource{
			AlarmRuleID: cmd.AlarmRule.ID,
			SourceID:    id,
		}
	}
	return cmd.alarmSourceRepo.Create(context.TODO(), sources...)
}

func (cmd AlarmRuleUpdateCmd) RemoveSources(ids []uint) error {
	return cmd.alarmSourceRepo.DeleteBySpecs(context.TODO(), spec.AlarmRuleEqSpec(cmd.AlarmRule.ID), spec.SourceInSpec(ids))
}
