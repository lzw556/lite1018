package vo

import "time"

type DeviceData struct {
	Timestamp int64       `json:"timestamp"`
	Values    interface{} `json:"values,omitempty"`
}

func NewDeviceData(time time.Time) DeviceData {
	return DeviceData{
		Timestamp: time.UTC().Unix(),
	}
}

type DeviceDataList []DeviceData

func (list DeviceDataList) Len() int {
	return len(list)
}

func (list DeviceDataList) Less(i, j int) bool {
	return list[i].Timestamp < list[j].Timestamp
}

func (list DeviceDataList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
