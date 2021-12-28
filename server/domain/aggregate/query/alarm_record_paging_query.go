package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type AlarmRecordPagingQuery struct {
	entity.AlarmRecords

	total           int64
	measurementRepo dependency.MeasurementRepository
	alarmRepo       dependency.AlarmRepository
}

func NewAlarmRecordPagingQuery(total int64) AlarmRecordPagingQuery {
	return AlarmRecordPagingQuery{
		total:           total,
		measurementRepo: repository.Measurement{},
		alarmRepo:       repository.Alarm{},
	}
}

func (query AlarmRecordPagingQuery) Paging() ([]vo.AlarmRecord, int64) {
	ctx := context.TODO()
	result := make([]vo.AlarmRecord, len(query.AlarmRecords))
	measurementMap := map[uint]po.Measurement{}
	alarmMap := map[uint]po.Alarm{}
	for i, e := range query.AlarmRecords {
		result[i] = vo.NewAlarmRecord(e)
		if _, ok := measurementMap[e.MeasurementID]; !ok {
			measurementMap[e.MeasurementID], _ = query.measurementRepo.Get(ctx, e.MeasurementID)
		}
		result[i].SetMeasurement(measurementMap[e.MeasurementID])
		if variable, err := measurementtype.GetVariable(measurementMap[e.MeasurementID].Type, e.Rule.Field); err == nil {
			result[i].SetField(variable)
		}
		if _, ok := alarmMap[e.AlarmID]; !ok {
			alarmMap[e.AlarmID], _ = query.alarmRepo.Get(ctx, e.AlarmID)
		}
		result[i].Name = alarmMap[e.AlarmID].Name
	}
	return result, query.total
}
