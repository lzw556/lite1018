package vo

type MeasurementAlert struct {
	Level uint `json:"level"`
}

func NewMeasurementAlert(level uint) MeasurementAlert {
	return MeasurementAlert{
		Level: level,
	}
}
