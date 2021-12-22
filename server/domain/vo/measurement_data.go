package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type MeasurementData struct {
	Timestamp int64              `json:"timestamp"`
	Fields    []MeasurementField `json:"fields"`
}

func NewMeasurementData(e po.MeasurementData) MeasurementData {
	return MeasurementData{
		Timestamp: e.Time.Unix(),
	}
}
