package entity

import "time"

type LargeSensorData struct {
	Time       time.Time `json:"time"`
	MacAddress string    `json:"mac_address"`
	SensorType uint32    `json:"sensor_type"`
	Values     []float32 `json:"values"`
}

func (LargeSensorData) BucketName() string {
	return "ts_large_sensor_data"
}
