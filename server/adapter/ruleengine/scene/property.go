package scene

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"strconv"
	"time"
)

type Property struct {
	po.Property
	entity.Device

	deviceDataRepo  dependency.DeviceDataRepository
	alarmRuleRepo   dependency.AlarmRuleRepository
	alarmRecordRepo dependency.AlarmRecordRepository
}

func NewProperty(p po.Property, d entity.Device) Property {
	return Property{
		Property:        p,
		Device:          d,
		deviceDataRepo:  repository.DeviceData{},
		alarmRuleRepo:   repository.AlarmRule{},
		alarmRecordRepo: repository.AlarmRecord{},
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
		current := data.Values[idx]
		return &current
	}
	return nil
}

func (s Property) Alert(alarmID uint, value float32, level uint) {
	if s.Device.GetAlarmState(alarmID) != level {
		ctx := context.TODO()
		rule, err := s.alarmRuleRepo.Get(ctx, alarmID)
		if err != nil {
			return
		}
		e := po.AlarmRecord{
			AlarmID:    alarmID,
			DeviceID:   rule.DeviceID,
			PropertyID: s.Property.ID,
			Rule:       rule.Rule,
			Value:      value,
			Level:      level,
		}
		e.CreatedAt = time.Now().UTC()
		if err := s.alarmRecordRepo.Create(ctx, &e); err != nil {
			xlog.Error("create alarm record failed", err)
			return
		}
		s.Device.UpdateAlarmState(alarmID, level)

		alert := vo.NewAlert()
		alert.Title = fmt.Sprintf("%s报警", rule.Name)
		threshold := strconv.FormatFloat(float64(rule.Rule.Threshold), 'f', s.Property.Precision, 64)
		alert.Content = fmt.Sprintf("设备【%s】的【%s】值%s设定阈值: %s%s", s.Device.Name, rule.Rule.Field, operation(rule.Rule.Operation), threshold, s.Property.Unit)
		alert.Field = rule.Rule.Field
		alert.Level = level
		alert.Data["device"] = map[string]interface{}{
			"id":   s.Device.ID,
			"name": s.Device.Name,
		}
		eventbus.Publish(eventbus.SocketEmit, "socket::alert", alert)
	}
}

func (s Property) Recovery(alarmID uint) {
	if s.Device.GetAlarmState(alarmID) != 0 {
		ctx := context.TODO()
		rule, err := s.alarmRuleRepo.Get(ctx, alarmID)
		if err != nil {
			return
		}
		s.Device.UpdateAlarmState(alarmID, 0)
		alert := vo.NewAlert()
		alert.Title = fmt.Sprintf("%s报警", rule.Name)
		alert.Content = fmt.Sprintf("设备【%s】的【%s】值已恢复正常", s.Device.Name, rule.Rule.Field)
		alert.Field = rule.Rule.Field
		alert.Level = 0
		alert.Data["device"] = map[string]interface{}{
			"id":   s.Device.ID,
			"name": s.Device.Name,
		}
		eventbus.Publish(eventbus.SocketEmit, "socket:alert", alert)
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
