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

type AlarmRecordCmd struct {
	entity.AlarmRecord

	repository      dependency.AlarmRecordRepository
	acknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
}

func NewAlarmRecordCmd() AlarmRecordCmd {
	return AlarmRecordCmd{
		repository:      repository.AlarmRecord{},
		acknowledgeRepo: repository.AlarmRecordAcknowledge{},
	}
}

func (cmd AlarmRecordCmd) AcknowledgeBy(req request.AcknowledgeAlarmRecord) error {
	if !cmd.AlarmRecord.Acknowledged {
		//cmd.AlarmRecord.Acknowledge()
		return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.repository.Save(txCtx, &cmd.AlarmRecord); err != nil {
				return err
			}
			_ = entity.AlarmRecordAcknowledge{
				AlarmRecordID: cmd.AlarmRecord.ID,
				UserID:        req.UserID,
				Note:          req.Note,
			}
			//if err := cmd.acknowledgeReentity.Create(txCtx, &e); err != nil {
			//	return err
			//}
			return nil
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
