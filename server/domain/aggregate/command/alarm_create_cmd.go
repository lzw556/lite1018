package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmCreateCmd struct {
	entity.Alarms

	alarmRepo dependency.AlarmRepository
}

func NewAlarmCreateCmd() AlarmCreateCmd {
	return AlarmCreateCmd{
		alarmRepo: repository.Alarm{},
	}
}

func (cmd AlarmCreateCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmRepo.BatchCreate(context.TODO(), cmd.Alarms); err != nil {
			return err
		}
		return ruleengine.UpdateRules(cmd.Alarms...)
	})
}
