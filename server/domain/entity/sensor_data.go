package entity

import (
	"time"
)

type SensorData struct {
	Time       time.Time              `json:"time"`
	MacAddress string                 `json:"mac_address"`
	SensorType uint                   `json:"sensor_type"`
	Values     map[string]interface{} `json:"values"`
}

func (d SensorData) BucketName() string {
	return "ts_device_data"
}

type SensorDataList []SensorData

func (list SensorDataList) Len() int {
	return len(list)
}

func (list SensorDataList) Less(i, j int) bool {
	return list[i].Time.After(list[j].Time)
}

func (list SensorDataList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
