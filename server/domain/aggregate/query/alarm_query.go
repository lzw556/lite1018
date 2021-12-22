package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmQuery struct {
	po.Alarm

	measurementRepo dependency.MeasurementRepository
}

func NewAlarmQuery() AlarmQuery {
	return AlarmQuery{
		measurementRepo: repository.Measurement{},
	}
}

func (query AlarmQuery) Detail() *vo.Alarm {
	result := vo.NewAlarm(query.Alarm)
	if m, err := query.measurementRepo.Get(context.TODO(), query.Alarm.MeasurementID); err == nil {
		result.Measurement = vo.NewMeasurement(m)
	}
	return &result
}
