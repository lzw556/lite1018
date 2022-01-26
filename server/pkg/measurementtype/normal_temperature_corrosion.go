package measurementtype

type NormalTemperatureCorrosion struct{}

func (NormalTemperatureCorrosion) ID() uint {
	return NormalTemperatureCorrosionType
}

func (NormalTemperatureCorrosion) Variables() Variables {
	return []Variable{
		{
			Name:      "thickness",
			Title:     "厚度",
			DataIndex: 0,
			Unit:      "mm",
			Type:      FloatVariableType,
			Precision: 3,
			Primary:   true,
			Sort:      0,
		},
		{
			Name:      "corrosion_rate",
			Title:     "腐蚀率",
			DataIndex: 0,
			Unit:      "mm/a",
			Type:      FloatVariableType,
			Precision: 3,
			Primary:   true,
			Sort:      1,
		},
		{
			Name:      "temperature",
			Title:     "温度",
			DataIndex: 1,
			Unit:      "°C",
			Type:      FloatVariableType,
			Precision: 3,
			Primary:   true,
			Sort:      2,
		},
		{
			Name:      "tof",
			Title:     "飞行时间",
			DataIndex: 3,
			Unit:      "ns",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      3,
		},
	}
}
