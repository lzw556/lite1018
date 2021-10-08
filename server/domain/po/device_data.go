package po

import (
	"time"
)

type DeviceData struct {
	Time       time.Time `json:"time"`
	DeviceID   uint      `json:"device_id"`
	SensorType uint      `json:"sensor_type"`
	Values     []float32 `json:"values"`
}

func (d DeviceData) BucketName() string {
	return "ts_device_data"
}
