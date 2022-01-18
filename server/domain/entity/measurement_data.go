package entity

import "time"

type MeasurementData struct {
	Time          time.Time              `json:"time"`
	Metadata      map[string]interface{} `json:"metadata"`
	Fields        map[string]interface{} `json:"fields"`
	MeasurementID uint                   `json:"measurement_id"`
}

func (MeasurementData) BucketName() string {
	return "ts_measurement_data"
}
