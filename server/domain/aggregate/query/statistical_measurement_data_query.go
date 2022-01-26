package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type StatisticalMeasurementDataQuery struct {
	po.Measurement

	measurementDataRepo dependency.MeasurementDataRepository
}

func NewStatisticalMeasurementDataQuery() StatisticalMeasurementDataQuery {
	return StatisticalMeasurementDataQuery{
		measurementDataRepo: repository.MeasurementData{},
	}
}

func (query StatisticalMeasurementDataQuery) Run() *vo.MeasurementDataStatistic {
	result := vo.MeasurementDataStatistic{}
	total, err := query.measurementDataRepo.FindAll(query.Measurement.ID)
	if err != nil {
		return nil
	}
	date := time.Now().Format("2006-01-02")
	result.Total = len(total)
	for _, data := range total {
		if data.Time.Format("2006-01-02") == date {
			result.Today = result.Today + 1
		}
	}
	return &result
}
