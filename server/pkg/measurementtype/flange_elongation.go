package measurementtype

type FlangeElongation struct {
}

func (FlangeElongation) ID() uint {
	return FlangeElongationType
}

func (FlangeElongation) Variables() Variables {
	return []Variable{
		{
			Name:      "preloads",
			Title:     "预紧力分布",
			DataIndex: 5,
			Unit:      "kN",
			Primary:   true,
			Type:      ArrayVariableType,
			Precision: 3,
			Sort:      0,
		},
	}
}
