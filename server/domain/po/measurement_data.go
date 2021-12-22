package po

import "time"

type MeasurementData struct {
	Time          time.Time              `json:"time"`
	Fields        map[string]interface{} `json:"fields"`
	MeasurementID uint                   `json:"measurement_id"`
}

func (MeasurementData) BucketName() string {
	return "ts_measurement_data"
}
