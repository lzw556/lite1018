package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRecordUpdateCmd struct {
	entity.AlarmRecord

	alarmRecordRepo      dependency.AlarmRecordRepository
	acknowledgeRepo      dependency.AlarmRecordAcknowledgeRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
	deviceRepo           dependency.DeviceRepository
}

func NewAlarmRecordUpdateCmd() AlarmRecordUpdateCmd {
	return AlarmRecordUpdateCmd{
		alarmRecordRepo:      repository.AlarmRecord{},
		acknowledgeRepo:      repository.AlarmRecordAcknowledge{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
		deviceRepo:           repository.Device{},
	}
}

func (cmd AlarmRecordUpdateCmd) AcknowledgeBy(req request.AcknowledgeAlarmRecord) error {
	if !cmd.AlarmRecord.Acknowledged {
		cmd.AlarmRecord.Acknowledge()
		return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.alarmRecordRepo.Save(txCtx, &cmd.AlarmRecord); err != nil {
				return err
			}
			e := entity.AlarmRecordAcknowledge{
				AlarmRecordID: cmd.AlarmRecord.ID,
				UserID:        req.UserID,
				Note:          req.Note,
			}
			if err := cmd.acknowledgeRepo.Create(txCtx, &e); err != nil {
				return err
			}
			switch cmd.AlarmRecord.Category {
			case entity.AlarmRuleCategoryDevice:
				if device, err := cmd.deviceRepo.Get(txCtx, cmd.AlarmRecord.SourceID); err == nil {
					if state, err := cmd.deviceAlertStateRepo.Get(device.MacAddress, cmd.AlarmRecord.AlarmRuleID); err == nil {
						if state.Record.ID == cmd.AlarmRecord.ID {
							device.RemoveAlarmRuleState(cmd.AlarmRecord.AlarmRuleID)
						}
					}
					return cmd.deviceAlertStateRepo.Delete(device.MacAddress, cmd.AlarmRecord.AlarmRuleID)
				}
			}
			return nil
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
