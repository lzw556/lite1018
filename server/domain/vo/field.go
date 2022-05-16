package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"

type Field struct {
	Name      string `json:"name"`
	Key       string `json:"key"`
	DataIndex int    `json:"dataIndex"`
}

func NewField(e devicetype.Field) Field {
	return Field{
		Name:      e.Name,
		Key:       e.Key,
		DataIndex: e.DataIndex,
	}
}

type Fields []Field
