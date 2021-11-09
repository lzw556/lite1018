package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Property struct {
	ID        uint         `json:"id"`
	Name      string       `json:"name"`
	Unit      string       `json:"unit"`
	Precision int          `json:"precision"`
	Fields    Fields       `json:"fields"`
	Data      PropertyData `json:"data"`
}

func NewProperty(e po.Property) Property {
	m := Property{
		ID:        e.ID,
		Name:      e.Name,
		Precision: e.Precision,
		Unit:      e.Unit,
	}
	m.Fields = make([]Field, 0)
	for k, idx := range e.Fields {
		m.Fields = append(m.Fields, Field{
			Index: idx,
			Name:  k,
			Unit:  e.Unit,
		})
	}
	return m
}
