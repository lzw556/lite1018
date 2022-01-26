package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceData struct {
	Timestamp int64     `json:"timestamp"`
	Values    []float32 `json:"values"`
}

func NewDeviceData(e entity.SensorData) DeviceData {
	return DeviceData{
		Timestamp: e.Time.UTC().Unix(),
		Values:    e.Values,
	}
}
