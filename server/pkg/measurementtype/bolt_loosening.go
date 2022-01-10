package measurementtype

type BoltLoosening struct {
}

func (b BoltLoosening) ID() uint {
	return BoltElongationType
}

func (b BoltLoosening) Variables() Variables {
	return []Variable{
		{
			DataIndex: 0,
			Name:      "loosening_angle",
			Title:     "松动角度",
			Unit:      "°",
			Precision: 3,
			Type:      FloatVariableType,
			Primary:   true,
			Sort:      0,
		},
		{
			DataIndex: 8,
			Name:      "attitude",
			Title:     "姿态指数",
			Unit:      "",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      1,
			Primary:   true,
		},
		{
			DataIndex: 5,
			Name:      "motion",
			Title:     "移动指数",
			Unit:      "",
			Type:      FloatVariableType,
			Precision: 3,
			Sort:      2,
			Primary:   true,
		},
	}
}
