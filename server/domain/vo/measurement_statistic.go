package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type MeasurementStatistic struct {
	Measurement Measurement `json:"measurement"`
	Status      uint        `json:"status"`
}

func NewMeasurementStatistic(e po.Measurement) MeasurementStatistic {
	return MeasurementStatistic{
		Measurement: NewMeasurement(e),
	}
}
