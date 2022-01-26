package query

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type StatisticalMeasurementAlertQuery struct {
	po.Measurement

	alarmRecordRepo dependency.AlarmRecordRepository
}

func NewStatisticalMeasurementAlertQuery() StatisticalMeasurementAlertQuery {
	return StatisticalMeasurementAlertQuery{
		alarmRecordRepo: repository.AlarmRecord{},
	}
}

func (query StatisticalMeasurementAlertQuery) Run() *vo.MeasurementAlertStatistic {
	ctx := context.TODO()
	result := vo.MeasurementAlertStatistic{}
	if total, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID)); err == nil {
		result.Total = int(total)
	}
	if untreated, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID), spec.StatusInSpec{uint(po.AlarmRecordStatusUntreated)}); err == nil {
		result.Untreated = int(untreated)
	}
	date := time.Now().Format("2006-01-02")
	begin, _ := time.Parse("2006-01-02 15:04:05", fmt.Sprintf("%s 00:00:00", date))
	end, _ := time.Parse("2006-01-02 15:04:05", fmt.Sprintf("%s 23:59:59", date))
	if today, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID), spec.StatusInSpec{uint(po.AlarmRecordStatusUntreated)}, spec.CreatedAtRangeSpec{begin, end}); err == nil {
		result.Today = int(today)
	}
	return &result
}
