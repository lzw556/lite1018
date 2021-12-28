package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"

type MeasurementField struct {
	measurementtype.Variable
	Value interface{} `json:"value,omitempty"`
}

func NewMeasurementField(e measurementtype.Variable) MeasurementField {
	return MeasurementField{
		Variable: e,
	}
}
