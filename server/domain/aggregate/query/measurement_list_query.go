package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type MeasurementListQuery struct {
	po.Measurements

	measurementDataRepo dependency.MeasurementDataRepository
}

func NewMeasurementListQuery() MeasurementListQuery {
	return MeasurementListQuery{
		measurementDataRepo: repository.MeasurementData{},
	}
}

func (query MeasurementListQuery) Run() []vo.Measurement {
	result := make([]vo.Measurement, len(query.Measurements))
	for i, measurement := range query.Measurements {
		result[i] = vo.NewMeasurement(measurement)
		if data, err := query.measurementDataRepo.Last(measurement.ID); err == nil {
			result[i].SetData(data)
		}
	}
	return result
}
