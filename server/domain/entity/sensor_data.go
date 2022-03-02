package entity

import (
	"time"
)

type SensorData struct {
	Time       time.Time          `json:"time"`
	MacAddress string             `json:"mac_address"`
	SensorType uint               `json:"sensor_type"`
	Values     map[string]float32 `json:"values"`
}

func (d SensorData) BucketName() string {
	return "ts_device_data"
}
