package ruleengine

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type MeasurementAlert struct {
	Measurement         po.Measurement
	Alarm               po.Alarm
	measurementDataRepo dependency.MeasurementDataRepository
	repository          dependency.MeasurementAlertRepository
	alarmRecordRepo     dependency.AlarmRecordRepository
}

func NewMeasurementAlert(m po.Measurement, a po.Alarm) *MeasurementAlert {
	return &MeasurementAlert{
		Measurement:         m,
		Alarm:               a,
		measurementDataRepo: repository.MeasurementData{},
		repository:          repository.MeasurementAlert{},
		alarmRecordRepo:     repository.AlarmRecord{},
	}
}

func (alert MeasurementAlert) Max() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		switch variable.Type {
		case measurementtype.FloatVariableType:
			return cast.ToFloat32(data.Fields[variable.Name])
		case measurementtype.ArrayVariableType:
			max := float32(0)
			values := data.Fields[variable.Name].([]float32)
			for _, value := range values {
				if max < value {
					max = value
				}
			}
			return max
		}
		return 0
	}
	return 0
}

func (alert MeasurementAlert) Min() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		switch variable.Type {
		case measurementtype.FloatVariableType:
			return cast.ToFloat32(data.Fields[variable.Name])
		case measurementtype.ArrayVariableType:
			min := float32(0)
			values := data.Fields[variable.Name].([]float32)
			for _, value := range values {
				if min > value {
					min = value
				}
			}
			return min
		}
	}
	return 0
}

func (alert MeasurementAlert) Mean() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		switch variable.Type {
		case measurementtype.FloatVariableType:
			return cast.ToFloat32(data.Fields[variable.Name])
		case measurementtype.ArrayVariableType:
			sum := float32(0)
			values := data.Fields[variable.Name].([]float32)
			for _, value := range values {
				sum += value
			}
			return sum / float32(len(values))
		}
	}
	return 0
}

func (alert MeasurementAlert) Current() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		switch variable.Type {
		case measurementtype.FloatVariableType:
			return cast.ToFloat32(data.Fields[variable.Name])
		case measurementtype.ArrayVariableType:
			return data.Fields[variable.Name].([]float32)[0]
		}
	}
	return 0
}

func (alert MeasurementAlert) X() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		if variable.Type == measurementtype.AxisVariableType {
			current := data.Fields[variable.Name].([]interface{})[0]
			return cast.ToFloat32(current)
		}
	}
	return 0
}

func (alert MeasurementAlert) Y() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		if variable.Type == measurementtype.AxisVariableType {
			current := data.Fields[variable.Name].([]interface{})[1]
			return cast.ToFloat32(current)
		}
	}
	return 0
}

func (alert MeasurementAlert) Z() float32 {
	if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
		data, err := alert.measurementDataRepo.Last(alert.Measurement.ID)
		if err != nil {
			return 0
		}
		if variable.Type == measurementtype.AxisVariableType {
			current := data.Fields[variable.Name].([]interface{})[2]
			return cast.ToFloat32(current)
		}
	}
	return 0
}

func (alert MeasurementAlert) Alert(value float32) {
	e, err := alert.repository.Get(alert.Measurement.ID)
	if err != nil {
		xlog.Error("get measurement alert failed", err)
		return
	}
	if e.ID == 0 {
		e = entity.MeasurementAlert{
			ID:      alert.Measurement.ID,
			Records: map[uint]entity.AlertRecord{},
		}
	}
	if e.Level(alert.Alarm.ID) < alert.Alarm.Level {
		record := po.AlarmRecord{
			MeasurementID: alert.Measurement.ID,
			AlarmID:       alert.Alarm.ID,
			Rule:          alert.Alarm.Rule,
			Level:         alert.Alarm.Level,
			Value:         value,
		}
		err = transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := alert.alarmRecordRepo.Create(context.TODO(), &record); err != nil {
				return err
			}
			e.Records[alert.Alarm.ID] = entity.AlertRecord{
				ID:    record.ID,
				Level: record.Level,
			}
			return alert.repository.Create(&e)
		})
		if err != nil {
			xlog.Error("create measurement alert failed", err)
			return
		}
		message := vo.AlertNotificationMessage{}
		message.AlarmRecord = vo.NewAlarmRecord(entity.AlarmRecord{AlarmRecord: record})
		if variable, err := measurementtype.GetVariable(alert.Measurement.Type, alert.Alarm.Rule.Field); err == nil {
			message.AlarmRecord.SetField(variable)
		}
		message.AlarmRecord.SetMeasurement(alert.Measurement)
		eventbus.Publish(eventbus.SocketEmit, "socket::measurementAlertMessage", message)
	}
}

func (alert MeasurementAlert) Recovery() {
	e, err := alert.repository.Get(alert.Measurement.ID)
	if err != nil {
		xlog.Error("get measurement alert failed", err)
		return
	}
	if e.ID == 0 {
		return
	}
	err = transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if record, ok := e.Records[alert.Alarm.ID]; ok {
			updates := map[string]interface{}{
				"status": po.AlarmRecordStatusRecovered,
			}
			if err := alert.alarmRecordRepo.Updates(txCtx, record.ID, updates); err != nil {
				return err
			}
		}
		e.RemoveAlarmRecord(alert.Alarm.ID)
		return alert.repository.Create(&e)
	})
	if err != nil {
		xlog.Errorf("recovery measurement [%d] alarm [%d] failed: %v", alert.Measurement.ID, alert.Alarm.ID, err)
		return
	}
}
