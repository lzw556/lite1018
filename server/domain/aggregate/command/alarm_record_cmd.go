package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
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
	measurementAlertRepo dependency.MeasurementAlertRepository
}

func NewAlarmRecordCmd() AlarmRecordCmd {
	return AlarmRecordCmd{
		repository:           repository.AlarmRecord{},
		acknowledgeRepo:      repository.AlarmRecordAcknowledge{},
		measurementAlertRepo: repository.MeasurementAlert{},
	}
}

func (cmd AlarmRecordCmd) AcknowledgeBy(req request.AcknowledgeAlarmRecord) error {
	if !cmd.AlarmRecord.Acknowledged {
		cmd.AlarmRecord.Acknowledge()
		return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.repository.Save(txCtx, &cmd.AlarmRecord.AlarmRecord); err != nil {
				return err
			}
			e := po.AlarmRecordAcknowledge{
				AlarmRecordID: cmd.AlarmRecord.ID,
				UserID:        req.UserID,
				Note:          req.Note,
			}
			if err := cmd.acknowledgeRepo.Create(txCtx, &e); err != nil {
				return err
			}
			alert, err := cmd.measurementAlertRepo.Get(cmd.AlarmRecord.MeasurementID)
			if err != nil {
				return err
			}
			alert.RemoveAlarmRecord(cmd.AlarmRecord.AlarmID)
			return cmd.measurementAlertRepo.Create(&alert)
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
