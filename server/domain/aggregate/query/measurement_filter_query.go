package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type MeasurementFilterQuery struct {
	po.Measurements

	measurementDataRepo  dependency.MeasurementDataRepository
	measurementAlertRepo dependency.MeasurementAlertRepository
}

func NewMeasurementFilterQuery() MeasurementFilterQuery {
	return MeasurementFilterQuery{
		measurementDataRepo:  repository.MeasurementData{},
		measurementAlertRepo: repository.MeasurementAlert{},
	}
}

func (query MeasurementFilterQuery) Run() []vo.Measurement {
	result := make([]vo.Measurement, len(query.Measurements))
	for i, measurement := range query.Measurements {
		result[i] = vo.NewMeasurement(measurement)
		if data, err := query.measurementDataRepo.Last(measurement.ID); err == nil {
			result[i].SetData(data)
		}
		if alert, err := query.measurementAlertRepo.Get(measurement.ID); err == nil {
			result[i].SetAlert(alert)
		}
	}
	return result
}
