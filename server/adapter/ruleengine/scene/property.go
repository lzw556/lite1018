package scene

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"strconv"
)

type Property struct {
	po.Property
	entity.Device

	deviceAlertStateRepo dependency.DeviceAlertStateRepository
	deviceDataRepo       dependency.DeviceDataRepository
	alarmRuleRepo        dependency.AlarmRuleRepository
	alarmRecordRepo      dependency.AlarmRecordRepository
}

func NewProperty(p po.Property, d entity.Device) Property {
	return Property{
		Property:             p,
		Device:               d,
		deviceAlertStateRepo: repository.DeviceAlertState{},
		deviceDataRepo:       repository.DeviceData{},
		alarmRuleRepo:        repository.AlarmRule{},
		alarmRecordRepo:      repository.AlarmRecord{},
	}
}

func (s Property) Value(value *float32) float32 {
	return *value
}

func (s Property) CURRENT(deviceID uint, field string) *float32 {
	data, err := s.deviceDataRepo.Last(deviceID)
	if err != nil {
		return nil
	}
	if idx, ok := s.Property.Fields[field]; ok {
		var current float32
		switch field {
		case "corrosion_rate":
			monthAgo, err := s.deviceDataRepo.Get(deviceID, data.Time.AddDate(0, -1, 0))
			if err != nil {
				return nil
			}
			current = calculate.CorrosionRate(monthAgo.Values[idx], data.Values[idx], data.Time.Sub(monthAgo.Time).Seconds())
		default:
			current = data.Values[idx]
		}
		return &current
	}

	return nil
}

func (s Property) Alert(alarmID uint, value float32, level uint) {
	alertState, err := s.deviceAlertStateRepo.Get(s.Device.ID)
	if err != nil {
		return
	}
	if alertState.GetAlarmState(alarmID).Record.Level < level {
		ctx := context.Background()
		alarm, err := s.alarmRuleRepo.Get(ctx, alarmID)
		if err != nil {
			return
		}
		e := po.AlarmRecord{
			AlarmID:    alarmID,
			DeviceID:   alarm.DeviceID,
			PropertyID: s.Property.ID,
			Rule:       alarm.Rule,
			Value:      value,
			Level:      level,
			Status:     po.AlarmRecordStatusUntreated,
		}
		if err := s.alarmRecordRepo.Create(ctx, &e); err != nil {
			xlog.Error("create alarm record failed", err)
			return
		}
		alertState.UpdateAlarmState(alarmID, e)
		if err := s.deviceAlertStateRepo.Save(s.Device.ID, &alertState); err != nil {
			xlog.Error("update device alert state failed", err)
			return
		}
		threshold := strconv.FormatFloat(float64(e.Rule.Threshold), 'f', s.Property.Precision, 64)
		current := strconv.FormatFloat(float64(value), 'f', s.Property.Precision, 64)
		message := vo.NewAlertMessage(
			s.Device.Name,
			devicetype.GetFieldName(e.Rule.Field),
			fmt.Sprintf("%s%s", current, s.Property.Unit),
			operation(e.Rule.Operation),
			fmt.Sprintf("%s%s", threshold, s.Property.Unit),
		)
		notification := vo.NewAlertNotification(alarm.Name, vo.DefaultAlertNotificationTmpl)
		if err := notification.Notify(message, e.Level, e.ID); err != nil {
			return
		}
	}
}

func (s Property) Recovery(alarmID uint, value float32) {
	alertState, err := s.deviceAlertStateRepo.Get(s.Device.ID)
	if err != nil {
		return
	}
	if alertState.GetAlarmState(alarmID).Record.Level != 0 {
		ctx := context.TODO()
		alarm, err := s.alarmRuleRepo.Get(ctx, alarmID)
		if err != nil {
			return
		}
		alarmState := alertState.GetAlarmState(alarm.ID)
		if alarmState.Record.ID > 0 {
			record, err := s.alarmRecordRepo.Get(ctx, alarmState.Record.ID)
			if err != nil {
				return
			}
			record.Status = po.AlarmRecordStatusRecovered
			if err := s.alarmRecordRepo.Save(ctx, &record.AlarmRecord); err != nil {
				xlog.Error("update alarm record status faield", err)
				return
			}
		}

		alertState.RemoveAlarmState(alarm.ID)
		if err := s.deviceAlertStateRepo.Save(s.Device.ID, &alertState); err != nil {
			xlog.Error("update device alert state failed", err)
			return
		}

		current := strconv.FormatFloat(float64(value), 'f', s.Property.Precision, 64)
		message := vo.NewAlertMessage(
			s.Device.Name,
			devicetype.GetFieldName(alarm.Rule.Field),
			fmt.Sprintf("%s%s", current, s.Property.Unit),
			operation(alarm.Rule.Operation),
			"",
		)
		notification := vo.NewAlertNotification(alarm.Name, vo.DefaultRecoveryNotificationTmpl)
		if err := notification.Notify(message, 0, 0); err != nil {
			return
		}
	}
}

func operation(op string) string {
	switch op {
	case ">", ">=":
		return "高于"
	case "<", "<=":
		return "低于"
	}
	return ""
}
