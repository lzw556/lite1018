package measurementtype

type BoltElongation struct {
}

func (BoltElongation) ID() uint {
	return BoltElongationType
}

func (BoltElongation) Variables() Variables {
	return []Variable{
		{
			Name:      "preload",
			Title:     "预紧力",
			DataIndex: 5,
			Unit:      "kN",
			Primary:   true,
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      0,
		},
		{
			Name:      "temperature",
			Title:     "温度",
			DataIndex: 1,
			Unit:      "°C",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      1,
			Primary:   true,
		},
		{
			Name:      "length",
			Title:     "长度",
			DataIndex: 0,
			Unit:      "mm",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      2,
			Primary:   true,
		},
		{
			Name:      "defect",
			Title:     "缺陷位置",
			DataIndex: 3,
			Unit:      "mm",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      3,
			Primary:   true,
		},
		{
			Name:      "tof",
			Title:     "飞行时间",
			DataIndex: 2,
			Unit:      "ns",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      4,
		},
	}
}
