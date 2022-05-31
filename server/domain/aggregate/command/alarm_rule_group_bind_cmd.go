package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRuleGroupBindCmd struct {
	entity.AlarmRuleGroup

	AlarmRuleGroupRepo dependency.AlarmRuleGroupRepository
	AlarmSourceRepo    dependency.AlarmSourceRepository
}

func NewAlarmRuleGroupBindCmd() AlarmRuleGroupBindCmd {
	return AlarmRuleGroupBindCmd{
		AlarmRuleGroupRepo: repository.AlarmRuleGroup{},
		AlarmSourceRepo:    repository.AlarmSource{},
	}
}

func (cmd AlarmRuleGroupBindCmd) Bind(req request.AlarmRuleGroupBind) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		for _, binding := range req.Bindings {
			result, err := cmd.AlarmSourceRepo.FindBySpecs(txCtx, spec.SourceEqSpec(binding.SourceID), spec.AlarmRuleEqSpec(binding.AlarmRuleID))
			if err != nil {
				return err
			}
			if len(result) == 0 {
				err := cmd.AlarmSourceRepo.Create(txCtx, entity.AlarmSource{
					SourceID:    binding.SourceID,
					AlarmRuleID: binding.AlarmRuleID,
				})
				if err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (cmd AlarmRuleGroupBindCmd) Unbind(req request.AlarmRuleGroupUnbind) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		for _, binding := range req.Bindings {
			err := cmd.AlarmSourceRepo.DeleteBySpecs(txCtx, spec.SourceEqSpec(binding.SourceID), spec.AlarmRuleEqSpec(binding.AlarmRuleID))
			if err != nil {
				return err
			}
		}

		return nil
	})
}
