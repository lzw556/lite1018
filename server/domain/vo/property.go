package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Property struct {
	ID     uint    `json:"id"`
	Name   string  `json:"name"`
	Unit   string  `json:"unit"`
	Fields []Field `json:"fields"`
}

func NewProperty(e po.Property) Property {
	m := Property{
		ID:   e.ID,
		Name: e.Name,
		Unit: e.Unit,
	}
	m.Fields = make([]Field, 0)
	for k := range e.Fields {
		m.Fields = append(m.Fields, Field{
			Name: k,
		})
	}
	return m
}
