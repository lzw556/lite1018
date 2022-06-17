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

	alarmRecordRepo               dependency.AlarmRecordRepository
	acknowledgeRepo               dependency.AlarmRecordAcknowledgeRepository
	deviceAlertStateRepo          dependency.DeviceAlertStateRepository
	deviceRepo                    dependency.DeviceRepository
	monitoringPointRepo           dependency.MonitoringPointRepository
	monitoringPointAlertStateRepo dependency.MonitoringPointAlertStateRepository
}

func NewAlarmRecordUpdateCmd() AlarmRecordUpdateCmd {
	return AlarmRecordUpdateCmd{
		alarmRecordRepo:               repository.AlarmRecord{},
		acknowledgeRepo:               repository.AlarmRecordAcknowledge{},
		deviceAlertStateRepo:          repository.DeviceAlertState{},
		deviceRepo:                    repository.Device{},
		monitoringPointRepo:           repository.MonitoringPoint{},
		monitoringPointAlertStateRepo: repository.MonitoringPointAlertState{},
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
					return cmd.deviceAlertStateRepo.Delete(device.MacAddress, cmd.AlarmRecord.AlarmRuleID)
				}
			case entity.AlarmRuleCategoryMonitoringPoint:
				if mp, err := cmd.monitoringPointRepo.Get(txCtx, cmd.AlarmRecord.SourceID); err == nil {
					return cmd.monitoringPointAlertStateRepo.Delete(mp.ID, cmd.AlarmRecord.AlarmRuleID)
				}
			}
			return nil
		})
	}
	return response.BusinessErr(errcode.AlarmRecordAlreadyAcknowledgedError, "")
}
