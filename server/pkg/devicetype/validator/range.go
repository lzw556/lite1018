package validator

import "github.com/spf13/cast"

type Range struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}

func (r Range) Validate(value interface{}) bool {
	v := cast.ToFloat64(value)
	return v >= r.Min && v <= r.Max
}
