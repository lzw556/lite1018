package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type DeviceData struct {
	Timestamp int64     `json:"timestamp"`
	Values    []float32 `json:"values"`
}

func NewDeviceData(e po.DeviceData) DeviceData {
	return DeviceData{
		Timestamp: e.Time.UTC().Unix(),
		Values:    e.Values,
	}
}
