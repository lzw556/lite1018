package entity

import "time"

type LargeSensorData struct {
	Time       time.Time `json:"time"`
	SensorType uint32    `json:"sensor_type"`
	MacAddress string    `json:"mac_address"`
	Data       []byte    `json:"data"`
}

func (LargeSensorData) BucketName() string {
	return "ts_large_sensor_data"
}
