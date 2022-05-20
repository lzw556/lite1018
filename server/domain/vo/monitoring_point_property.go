package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"

type MPProperty struct {
	Name      string                 `json:"name"`
	Key       string                 `json:"key"`
	Unit      string                 `json:"unit"`
	Sort      int                    `json:"sort"`
	Precision int                    `json:"precision"`
	Fields    MPFields               `json:"fields"`
	Data      map[string]interface{} `json:"data,omitempty"`
}

func NewMonitoringPointProperty(e monitoringpointtype.Property) MPProperty {
	p := MPProperty{
		Name:      e.Name,
		Key:       e.Key,
		Unit:      e.Unit,
		Precision: e.Precision,
		Sort:      e.Sort,
		Data:      map[string]interface{}{},
	}
	p.Fields = make(MPFields, len(e.Fields))
	for i, field := range e.Fields {
		p.Fields[i] = NewMPField(field)
	}
	return p
}

func (p *MPProperty) SetData(key string, value interface{}) {
	p.Data[key] = value
}

type MPProperties []MPProperty

func (ps MPProperties) Len() int {
	return len(ps)
}

func (ps MPProperties) Less(i, j int) bool {
	return ps[i].Sort < ps[j].Sort
}

func (ps MPProperties) Swap(i, j int) {
	ps[i], ps[j] = ps[j], ps[i]
}
