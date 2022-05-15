package vo

import "time"

type MonitoringPointData struct {
	Timestamp int64       `json:"timestamp"`
	Values    interface{} `json:"values,omitempty"`
}

func NewMonitoringPointData(time time.Time) MonitoringPointData {
	return MonitoringPointData{
		Timestamp: time.UTC().Unix(),
	}
}

type MonitoringPointDataList []MonitoringPointData

func (list MonitoringPointDataList) Len() int {
	return len(list)
}

func (list MonitoringPointDataList) Less(i, j int) bool {
	return list[i].Timestamp > list[j].Timestamp
}

func (list MonitoringPointDataList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
