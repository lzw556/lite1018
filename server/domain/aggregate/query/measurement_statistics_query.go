package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type MeasurementStatisticsQuery struct {
	po.Measurements

	measurementAlertRepo dependency.MeasurementAlertRepository
}

func NewMeasurementStatisticsQuery() MeasurementStatisticsQuery {
	return MeasurementStatisticsQuery{
		measurementAlertRepo: repository.MeasurementAlert{},
	}
}

func (query MeasurementStatisticsQuery) Run() ([]vo.MeasurementStatistic, error) {
	result := make([]vo.MeasurementStatistic, len(query.Measurements))
	for i, measurement := range query.Measurements {
		result[i] = vo.NewMeasurementStatistic(measurement)
		if alert, err := query.measurementAlertRepo.Get(measurement.ID); err == nil {
			result[i].Status = alert.MeasurementStatus()
		}
	}
	return result, nil
}
