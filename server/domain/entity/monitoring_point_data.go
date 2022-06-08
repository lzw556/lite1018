package entity

import (
	"time"
)

type MonitoringPointData struct {
	Time              time.Time              `json:"time"`
	MonitoringPointID uint                   `json:"monitoring_ponint_id"`
	MacAddress        string                 `json:"mac_address"`
	Category          uint                   `json:"category"`
	Values            map[string]interface{} `json:"values"`
}

func (d MonitoringPointData) BucketName() string {
	return "ts_monitoring_point_data"
}

type MonitoringPointDataList []SensorData

func (list MonitoringPointDataList) Len() int {
	return len(list)
}

func (list MonitoringPointDataList) Less(i, j int) bool {
	return list[i].Time.After(list[j].Time)
}

func (list MonitoringPointDataList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
