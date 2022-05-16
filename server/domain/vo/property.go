package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"

type Property struct {
	Name      string                 `json:"name"`
	Key       string                 `json:"key"`
	Unit      string                 `json:"unit"`
	Sort      int                    `json:"sort"`
	Precision int                    `json:"precision"`
	Fields    Fields                 `json:"fields"`
	Data      map[string]interface{} `json:"data,omitempty"`
}

func NewProperty(e devicetype.Property) Property {
	p := Property{
		Name:      e.Name,
		Key:       e.Key,
		Unit:      e.Unit,
		Precision: e.Precision,
		Sort:      e.Sort,
		Data:      map[string]interface{}{},
	}
	p.Fields = make(Fields, len(e.Fields))
	for i, field := range e.Fields {
		p.Fields[i] = NewField(field)
	}
	return p
}

func (p *Property) SetData(key string, value interface{}) {
	p.Data[key] = value
}

type Properties []Property

func (ps Properties) Len() int {
	return len(ps)
}

func (ps Properties) Less(i, j int) bool {
	return ps[i].Sort < ps[j].Sort
}

func (ps Properties) Swap(i, j int) {
	ps[i], ps[j] = ps[j], ps[i]
}
