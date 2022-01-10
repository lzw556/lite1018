package measurementtype

type AngleDip struct{}

func (AngleDip) ID() uint {
	return AngleDipType
}

func (AngleDip) Variables() Variables {
	return []Variable{
		{
			Name:      "inclination",
			Title:     "倾斜角",
			Unit:      "°",
			Type:      FloatVariableType,
			Precision: 3,
			DataIndex: 0,
			Sort:      0,
			Primary:   true,
		},
		{
			Name:      "pitch",
			Title:     "俯仰角",
			Unit:      "°",
			Type:      FloatVariableType,
			Precision: 3,
			DataIndex: 1,
			Sort:      1,
			Primary:   true,
		},
		{
			Name:      "roll",
			Title:     "翻滚角",
			Unit:      "°",
			Type:      FloatVariableType,
			Precision: 3,
			DataIndex: 2,
			Sort:      2,
			Primary:   true,
		},
	}
}
