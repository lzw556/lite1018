package monitoringpointtype

type BoltAngle struct{}

func (BoltAngle) ID() uint {
	return MonitoringPointTypeBoltAngle
}

func (BoltAngle) Properties() []Property {
	return []Property{
		{
			Key:       "loosening_angle",
			Name:      "松动角度",
			Unit:      "°",
			Precision: 3,
			Sort:      0,
			Fields: []Field{
				{
					Name:      "松动角度",
					Key:       "loosening_angle",
					DataIndex: 0,
				},
			},
		},
		{
			Key:       "attitude",
			Name:      "姿态指数",
			Unit:      "",
			Precision: 3,
			Sort:      1,
			Fields: []Field{
				{
					Name:      "姿态指数",
					Key:       "attitude",
					DataIndex: 8,
				},
			},
		},
		{
			Key:       "motion",
			Name:      "移动指数",
			Unit:      "",
			Precision: 3,
			Sort:      2,
			Fields: []Field{
				{
					Name:      "移动指数",
					Key:       "motion",
					DataIndex: 5,
				},
			},
		},
		{
			Key:       "temperature",
			Name:      "温度",
			Unit:      "°C",
			Precision: 3,
			Sort:      3,
			Fields: []Field{
				{
					Name:      "温度",
					Key:       "temperature",
					DataIndex: 10,
				},
			},
		},
	}
}
