package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AlarmRecordCmd struct {
	entity.AlarmRecord

	repository           dependency.AlarmRecordRepository
	acknowledgeRepo      dependency.AlarmRecordAcknowledgeRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
}

func NewAlarmRecordCmd() AlarmRecordCmd {
	return AlarmRecordCmd{
		repository:           repository.AlarmRecord{},
		acknowledgeRepo:      repository.AlarmRecordAcknowledge{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
	}
}

func (cmd AlarmRecordCmd) AcknowledgeBy(userID uint) error {
	if !cmd.AlarmRecord.Acknowledged {
		cmd.AlarmRecord.Acknowledge()
		return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.repository.Save(txCtx, &cmd.AlarmRecord.AlarmRecord); err != nil {
				return err
			}
			e := po.AlarmRecordAcknowledge{
				AlarmRecordID: cmd.AlarmRecord.ID,
				UserID:        userID,
			}
			if err := cmd.acknowledgeRepo.Create(txCtx, &e); err != nil {
				return err
			}
			alertState, err := cmd.deviceAlertStateRepo.Get(cmd.AlarmRecord.DeviceID)
			if err != nil {
				return err
			}
			alertState.Acknowledged(cmd.AlarmRecord.ID)
			return cmd.deviceAlertStateRepo.Save(cmd.AlarmRecord.DeviceID, &alertState)
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
