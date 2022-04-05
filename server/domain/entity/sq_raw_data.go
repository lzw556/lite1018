package entity

type SqRawData struct {
	Metadata struct {
		Odr    uint16 `json:"odr" mapstructure:"odr"`
		Number uint16 `json:"number" mapstructure:"number"`
	} `json:"metadata" mapstructure:"metadata"`
	Values []float64 `json:"values" mapstructure:"values"`
}
