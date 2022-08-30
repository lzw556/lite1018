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

	AlarmRuleGroupRepo       dependency.AlarmRuleGroupRepository
	AlarmRuleGroupSourceRepo dependency.AlarmRuleGroupSourceRepository
	AlarmSourceRepo          dependency.AlarmSourceRepository
	MonitoringPointRepo      dependency.MonitoringPointRepository
}

func NewAlarmRuleGroupBindCmd() AlarmRuleGroupBindCmd {
	return AlarmRuleGroupBindCmd{
		AlarmRuleGroupRepo:       repository.AlarmRuleGroup{},
		AlarmRuleGroupSourceRepo: repository.AlarmRuleGroupSource{},
		AlarmSourceRepo:          repository.AlarmSource{},
		MonitoringPointRepo:      repository.MonitoringPoint{},
	}
}

func (cmd AlarmRuleGroupBindCmd) Bind(req request.AlarmRuleGroupBind) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		bindings, err := cmd.AlarmRuleGroupSourceRepo.FindBySpecs(txCtx, spec.GroupIDEqSpec(cmd.AlarmRuleGroup.ID))
		if err != nil {
			return err
		}

		for _, mpID := range req.MonitoringPointIDs {
			if _, err := cmd.MonitoringPointRepo.Get(txCtx, mpID); err != nil {
				return err
			}
			for _, binding := range bindings {
				result, err := cmd.AlarmSourceRepo.FindBySpecs(txCtx, spec.SourceEqSpec(mpID), spec.AlarmRuleEqSpec(binding.AlarmRuleID))
				if err != nil {
					return err
				}
				if len(result) == 0 {
					err := cmd.AlarmSourceRepo.Create(txCtx, entity.AlarmSource{
						SourceID:    mpID,
						AlarmRuleID: binding.AlarmRuleID,
					})
					if err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

func (cmd AlarmRuleGroupBindCmd) Unbind(req request.AlarmRuleGroupUnbind) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		bindings, err := cmd.AlarmRuleGroupSourceRepo.FindBySpecs(txCtx, spec.GroupIDEqSpec(cmd.AlarmRuleGroup.ID))
		if err != nil {
			return err
		}

		for _, mpID := range req.MonitoringPointIDs {
			if _, err := cmd.MonitoringPointRepo.Get(txCtx, mpID); err != nil {
				return err
			}

			for _, binding := range bindings {
				err := cmd.AlarmSourceRepo.DeleteBySpecs(txCtx, spec.SourceEqSpec(mpID), spec.AlarmRuleEqSpec(binding.AlarmRuleID))
				if err != nil {
					return err
				}
			}
		}

		return nil
	})
}
