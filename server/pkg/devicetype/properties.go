package devicetype

const (
	FloatPropertyType = "float"
	AxisPropertyType  = "axis"
)

type Property struct {
	Name        string      `json:"name"`
	Key         string      `json:"key"`
	Type        string      `json:"type"`
	Unit        string      `json:"unit"`
	Precision   int         `json:"precision"`
	DataIndexes []uint      `json:"dataIndexes"`
	Value       interface{} `json:"value"`
	Sort        int         `json:"sort"`
}

func (p Property) Convert(values []float32) interface{} {
	switch len(p.DataIndexes) {
	case 1:
		if p.DataIndexes[0] < uint(len(values)) {
			return values[p.DataIndexes[0]]
		}
	case 3:
		if p.DataIndexes[0] < uint(len(values)) &&
			p.DataIndexes[1] < uint(len(values)) &&
			p.DataIndexes[2] < uint(len(values)) {
			return []interface{}{values[p.DataIndexes[0]], values[p.DataIndexes[1]], values[p.DataIndexes[2]]}
		}

	}
	return 0
}

type Properties []Property

func (ps Properties) Get(key string) (Property, bool) {
	for _, p := range ps {
		if p.Key == key {
			return p, true
		}
	}
	return Property{}, false
}
