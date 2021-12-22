package measurementtype

type VariableType uint

const (
	FloatVariableType VariableType = iota + 1
	ArrayVariableType
)

type Variable struct {
	Index     int          `json:"index"`
	Name      string       `json:"name"`
	Title     string       `json:"title"`
	Unit      string       `json:"unit"`
	Precision int          `json:"precision"`
	Type      VariableType `json:"type"`
	Primary   bool         `json:"primary"`
}

var Variables = map[Type]map[string]Variable{
	BoltLoosening: {
		"loosening_angel": {
			Index:     0,
			Name:      "loosening_angel",
			Title:     "松动角度",
			Unit:      "°",
			Precision: 3,
			Type:      FloatVariableType,
			Primary:   true,
		},
		"attitude": {
			Index:     8,
			Name:      "attitude",
			Title:     "姿态指数",
			Unit:      "",
			Type:      FloatVariableType,
			Precision: 3,
		},
		"motion": {
			Index:     5,
			Name:      "motion",
			Title:     "移动指数",
			Unit:      "",
			Type:      FloatVariableType,
			Precision: 3,
		},
	},
	BoltElongation: {
		"preload": {
			Name:      "preload",
			Title:     "预紧力",
			Unit:      "kN",
			Primary:   true,
			Type:      FloatVariableType,
			Precision: 3,
		},
		"temperature": {
			Name:      "temperature",
			Title:     "温度",
			Unit:      "°C",
			Type:      FloatVariableType,
			Precision: 3,
		},
		"length": {
			Name:      "length",
			Title:     "长度",
			Unit:      "mm",
			Type:      FloatVariableType,
			Precision: 3,
		},
		"defect": {
			Name:      "defect",
			Title:     "缺陷位置",
			Unit:      "mm",
			Type:      FloatVariableType,
			Precision: 3,
		},
		"tof": {
			Name:      "tof",
			Title:     "飞行时间",
			Unit:      "ns",
			Type:      FloatVariableType,
			Precision: 3,
		},
	},
}
