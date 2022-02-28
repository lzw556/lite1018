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

	alarmRecordRepo dependency.AlarmRecordRepository
	acknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
}

func NewAlarmRecordUpdateCmd() AlarmRecordUpdateCmd {
	return AlarmRecordUpdateCmd{
		alarmRecordRepo: repository.AlarmRecord{},
		acknowledgeRepo: repository.AlarmRecordAcknowledge{},
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
			return cmd.acknowledgeRepo.Create(txCtx, &e)
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
