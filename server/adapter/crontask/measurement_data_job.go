package crontask

import (
	"context"
	"github.com/robfig/cron/v3"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/strategy/measurement"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type MeasurementData struct {
	po.Measurement

	repository dependency.MeasurementDataRepository
	alarmRepo  dependency.AlarmRepository
}

func NewMeasurementDataJob(e po.Measurement) Job {
	return &MeasurementData{
		Measurement: e,
		repository:  repository.MeasurementData{},
		alarmRepo:   repository.Alarm{},
	}
}

func (m MeasurementData) ID() string {
	return cast.ToString(m.Measurement.ID)
}

func (m MeasurementData) Schedule() cron.Schedule {
	period := cast.ToDuration(cast.ToInt(m.PollingPeriod)) * time.Millisecond
	return &MeasurementSchedule{
		Every: period,
	}
}

func (m MeasurementData) Run() {
	xlog.Infof("run measurement data job: %s", m.Name)
	var strategy measurement.Strategy
	switch m.Measurement.Type {
	case measurementtype.BoltLooseningType:
		strategy = measurement.NewBoltLooseningStrategy()
	case measurementtype.BoltElongationType:
		strategy = measurement.NewBoltElongationStrategy()
	case measurementtype.AngleDipType:
		strategy = measurement.NewAngleDipStrategy()
	case measurementtype.Vibration3AxisType:
		strategy = measurement.NewVibration3AxisStrategy()
	case measurementtype.NormalTemperatureCorrosionType:
		strategy = measurement.NewNormalTemperatureCorrosionStrategy()
	default:
		xlog.Errorf("unknown measurement type: %s", m.Measurement.Type)
		return
	}
	data, err := strategy.Do(m.Measurement)
	if err != nil {
		xlog.Errorf("do measurement field: %v", err)
	}
	if err := m.repository.Create(data); err != nil {
		xlog.Errorf("save measurement data failed: %v", err)
		return
	}
	alarms, err := m.alarmRepo.FindBySpecs(context.TODO(), spec.MeasurementEqSpec(m.Measurement.ID))
	if err != nil {
		xlog.Errorf("find alarm failed: %v", err)
		return
	}
	go ruleengine.ExecuteSelectedRules(m.Measurement, alarms)
}
