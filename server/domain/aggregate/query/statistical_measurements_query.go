package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sync"
)

type StatisticalMeasurementsQuery struct {
	po.Measurements

	measurementAlertRepo dependency.MeasurementAlertRepository
}

func NewStatisticalMeasurementsQuery() StatisticalMeasurementsQuery {
	return StatisticalMeasurementsQuery{
		measurementAlertRepo: repository.MeasurementAlert{},
	}
}

func (query StatisticalMeasurementsQuery) Run() []vo.MeasurementStatistic {
	result := make([]vo.MeasurementStatistic, len(query.Measurements))
	var wg sync.WaitGroup
	for i, measurement := range query.Measurements {
		wg.Add(1)
		go func(i int, measurement po.Measurement) {
			defer wg.Done()
			result[i] = vo.NewMeasurementStatistic(measurement)
			if alert, err := query.measurementAlertRepo.Get(measurement.ID); err == nil {
				result[i].Status = alert.MeasurementStatus()
			}
		}(i, measurement)
	}
	wg.Wait()
	return result
}
