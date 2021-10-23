package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Field struct {
	Index  uint      `json:"index"`
	Name   string    `json:"name"`
	Unit   string    `json:"unit"`
	Values []float32 `json:"values,omitempty"`
}

type Fields []Field

func (fs Fields) SetData(e po.DeviceData) {
	for _, f := range fs {
		f.Values = append(f.Values, e.Values[f.Index])
	}
}
