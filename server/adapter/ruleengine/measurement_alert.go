package ruleengine

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
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
		if err := alert.alarmRecordRepo.Create(context.TODO(), &record); err != nil {
			xlog.Error("create alarm record failed", err)
			return
		}
		e.Records[alert.Alarm.ID] = entity.AlertRecord{
			ID:    record.ID,
			Level: record.Level,
		}
		if err := alert.repository.Create(&e); err != nil {
			xlog.Error("create measurement alert failed", err)
			return
		}
	}
}

func (alert MeasurementAlert) Recovery() {
	fmt.Println(alert.Current())
}
