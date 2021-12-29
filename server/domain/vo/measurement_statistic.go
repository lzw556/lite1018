package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type MeasurementStatistic struct {
	Measurement Measurement              `json:"measurement"`
	Status      uint                     `json:"status"`
	Data        MeasurementDataStatistic `json:"data,omitempty"`
	Alert       struct {
		Total     int `json:"total"`
		Today     int `json:"today"`
		Untreated int `json:"untreated"`
	} `json:"alert,omitempty"`
}

func NewMeasurementStatistic(e po.Measurement) MeasurementStatistic {
	return MeasurementStatistic{
		Measurement: NewMeasurement(e),
	}
}
