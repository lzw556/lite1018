package vo

import "time"

type DeviceData struct {
	Timestamp  int64      `json:"timestamp"`
	Properties Properties `json:"properties"`
}

func NewDeviceData(time time.Time, properties Properties) DeviceData {
	return DeviceData{
		Timestamp:  time.UTC().Unix(),
		Properties: properties,
	}
}
