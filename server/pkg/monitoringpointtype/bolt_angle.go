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
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "松动角度",
					Key:       "loosening_angle",
					DataIndex: 0,
				},
			},
		},
		{
			Key:       "absolute_angle",
			Name:      "绝对角度",
			Unit:      "°",
			Precision: 3,
			Sort:      1,
			IsShow:    false,
			Fields: []Field{
				{
					Name:      "绝对角度",
					Key:       "absolute_angle",
					DataIndex: 1,
				},
			},
		},
		{
			Key:       "attitude",
			Name:      "姿态指数",
			Unit:      "",
			Precision: 3,
			Sort:      2,
			IsShow:    true,
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
			Sort:      4,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "移动指数",
					Key:       "motion",
					DataIndex: 5,
				},
			},
		},
		{
			Key:       "measurement_index",
			Name:      "测量指数",
			Unit:      "",
			Precision: 3,
			Sort:      5,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "测量指数",
					Key:       "measurement_index",
					DataIndex: 6,
				},
			},
		},
		{
			Key:       "temperature",
			Name:      "温度",
			Unit:      "°C",
			Precision: 3,
			Sort:      3,
			IsShow:    true,
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
