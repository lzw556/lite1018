package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmPagingQuery struct {
	po.Alarms
	total int64

	measurementRepo dependency.MeasurementRepository
}

func NewAlarmPagingQuery(total int64) AlarmPagingQuery {
	return AlarmPagingQuery{
		total:           total,
		measurementRepo: repository.Measurement{},
	}
}

func (query AlarmPagingQuery) Query() ([]vo.Alarm, int64) {
	ctx := context.TODO()
	result := make([]vo.Alarm, len(query.Alarms))
	measurementMap := make(map[uint]po.Measurement, 0)
	for i, alarm := range query.Alarms {
		result[i] = vo.NewAlarm(alarm)
		if _, ok := measurementMap[alarm.MeasurementID]; !ok {
			measurementMap[alarm.MeasurementID], _ = query.measurementRepo.Get(ctx, alarm.MeasurementID)
		}
		result[i].Measurement = vo.NewMeasurement(measurementMap[alarm.MeasurementID])
	}
	return result, query.total
}
