package vo

type Field struct {
	Name   string    `json:"name"`
	Unit   string    `json:"unit"`
	Values []float32 `json:"values,omitempty"`
}
