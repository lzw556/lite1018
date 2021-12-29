package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MeasurementRawData struct {
	Timestamp int64     `json:"timestamp"`
	Values    []float32 `json:"values,omitempty"`
}

func NewMeasurementRawData(e entity.LargeSensorData) MeasurementRawData {
	return MeasurementRawData{
		Timestamp: e.Time.Unix(),
	}
}
