package entity

type SasRawData struct {
	Metadata struct {
		Odr               uint16  `json:"odr" mapstructure:"odr"`
		Number            uint16  `json:"number" mapstructure:"number"`
		Temperature       float32 `json:"temperature" mapstructure:"temperature"`
		DefectLocation    float32 `json:"defect_location" mapstructure:"defect_location"`
		DefectGrade       float32 `json:"defect_grade" mapstructure:"defect_grade"`
		Value             float32 `json:"value" mapstructure:"value"`
		DataCount         float32 `json:"data_count" mapstructure:"data_count"`
		IntensityPressure float32 `json:"intensity_pressure" mapstructure:"intensity_pressure"`
		AccelerationX     float32 `json:"acceleration_x" mapstructure:"acceleration_x"`
		AccelerationY     float32 `json:"acceleration_y" mapstructure:"acceleration_y"`
		AccelerationZ     float32 `json:"acceleration_z" mapstructure:"acceleration_z"`
	} `json:"metadata" mapstructure:"metadata"`
	Values []float64 `json:"values" mapstructure:"values"`
}
