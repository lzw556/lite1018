package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"

type MeasurementField struct {
	Name      string      `json:"name"`
	Title     string      `json:"title"`
	Value     interface{} `json:"value,omitempty"`
	Unit      string      `json:"unit"`
	Precision int         `json:"precision"`
	Type      uint        `json:"type"`
	Primary   bool        `json:"primary"`
}

func NewMeasurementField(e measurementtype.Variable) MeasurementField {
	return MeasurementField{
		Name:      e.Name,
		Title:     e.Title,
		Unit:      e.Unit,
		Precision: e.Precision,
		Type:      uint(e.Type),
		Primary:   e.Primary,
	}
}
