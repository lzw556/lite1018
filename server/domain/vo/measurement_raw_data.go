package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type MeasurementRawData struct {
	Time   time.Time `json:"time"`
	Values []float32 `json:"values"`
}

func NewMeasurementRawData(e entity.LargeSensorData) MeasurementRawData {
	return MeasurementRawData{
		Time:   e.Time,
		Values: e.Values,
	}
}
