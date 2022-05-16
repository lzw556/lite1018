package devicetype

type Property struct {
	Name      string  `json:"name"`
	Key       string  `json:"key"`
	Unit      string  `json:"unit"`
	Precision int     `json:"precision"`
	Sort      int     `json:"sort"`
	IsShow    bool    `json:"-"`
	Fields    []Field `json:"fields"`
}

type Field struct {
	Name      string `json:"name"`
	Key       string `json:"key"`
	DataIndex int    `json:"dataIndex"`
}

type Properties []Property
