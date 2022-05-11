package entity

import (
	"time"
)

type MonitoringPointData struct {
	Time              time.Time              `json:"time"`
	MonitoringPointID uint                   `json:"monitoring_ponint_id"`
	MacAddress        string                 `json:"mac_address"`
	SensorType        uint                   `json:"sensor_type"`
	Values            map[string]interface{} `json:"values"`
}

func (d MonitoringPointData) BucketName() string {
	return "ts_monitoring_point_data"
}
