package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"

type Property struct {
	Name      string                 `json:"name"`
	Key       string                 `json:"key"`
	Unit      string                 `json:"unit"`
	Sort      int                    `json:"sort"`
	Precision int                    `json:"precision"`
	Data      map[string]interface{} `json:"data"`
}

func NewProperty(e devicetype.Property) Property {
	return Property{
		Name:      e.Name,
		Key:       e.Key,
		Unit:      e.Unit,
		Precision: e.Precision,
		Sort:      e.Sort,
		Data:      map[string]interface{}{},
	}
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
