package entity

type SasRawData struct {
	Metadata struct {
		Odr                  uint16  `json:"odr" mapstructure:"odr"`
		Number               uint16  `json:"number" mapstructure:"number"`
		Temperature          float32 `json:"temperature" mapstructure:"temperature"`
		DefectLocation       float32 `json:"defect_location" mapstructure:"defect_location"`
		DefectGrade          float32 `json:"defect_grade" mapstructure:"defect_grade"`
		Value                float32 `json:"value" mapstructure:"value"`
		DataCount            float32 `json:"data_count" mapstructure:"data_count"`
		MinLength            float32 `json:"min_length" mapstructure:"min_length"`
		MinTof               float32 `json:"min_tof" mapstructure:"min_tof"`
		MinPreload           float32 `json:"min_preload" mapstructure:"min_preload"`
		MinIntensityPressure float32 `json:"min_intensity_pressure" mapstructure:"min_intensity_pressure"`
		MaxLength            float32 `json:"max_length" mapstructure:"max_length"`
		MaxTof               float32 `json:"max_tof" mapstructure:"max_tof"`
		MaxPreload           float32 `json:"max_preload" mapstructure:"max_preload"`
		MaxIntensityPressure float32 `json:"max_intensity_pressure" mapstructure:"max_intensity_pressure"`
	} `json:"metadata" mapstructure:"metadata"`
	DynamicLength       []float32             `json:"dynamic_length" mapstructure:"dynamic_length"`
	DynamicTof          []float32             `json:"dynamic_tof" mapstructure:"dynamic_tof"`
	DynamicPreload      []float32             `json:"dynamic_preload" mapstructure:"dynamic_preload"`
	DynamicPressure     []float32             `json:"dynamic_pressure" mapstructure:"dynamic_pressure"`
	DynamicAcceleration []DynamicAcceleration `json:"dynamic_acceleration" mapstructure:"dynamic_acceleration"`
}

type DynamicAcceleration struct {
	XAxis float32 `json:"XAxis" mapstructure:"XAxis"`
	YAxis float32 `json:"YAxis" mapstructure:"YAxis"`
	ZAxis float32 `json:"ZAxis" mapstructure:"ZAxis"`
}
