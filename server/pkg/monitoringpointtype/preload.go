package monitoringpointtype

type Preload struct{}

func (Preload) ID() uint {
	return MonitoringPointTypePreload
}

func (Preload) Properties() []Property {
	return []Property{
		{
			Key:       "preload",
			Name:      "预紧力",
			Unit:      "kN",
			Precision: 3,
			Sort:      0,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "预紧力",
					Key:       "preload",
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
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "温度",
					Key:       "temperature",
					DataIndex: 1,
				},
			},
		},
		{
			Key:       "length",
			Name:      "长度",
			Unit:      "mm",
			Precision: 3,
			Sort:      2,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "长度",
					Key:       "length",
					DataIndex: 0,
				},
			},
		},
		{
			Key:       "defect_location",
			Name:      "缺陷位置",
			Unit:      "mm",
			Precision: 3,
			Sort:      5,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "缺陷位置",
					Key:       "defect_location",
					DataIndex: 3,
				},
			},
		},
		{
			Key:       "defect_level",
			Name:      "缺陷等级",
			Unit:      "",
			Precision: 3,
			Sort:      6,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "缺陷等级",
					Key:       "defect_level",
					DataIndex: 6,
				},
			},
		},
		{
			Key:       "tof",
			Name:      "飞行时间",
			Unit:      "ns",
			Precision: 3,
			Sort:      4,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "飞行时间",
					Key:       "tof",
					DataIndex: 2,
				},
			},
		},
		{
			Key:       "signal_strength",
			Name:      "信号强度",
			Unit:      "",
			Precision: 3,
			Sort:      7,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号强度",
					Key:       "signal_strength",
					DataIndex: 4,
				},
			},
		},
		{
			Key:       "signal_quality",
			Name:      "信号质量",
			Unit:      "",
			Precision: 3,
			Sort:      8,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号质量",
					Key:       "signal_quality",
					DataIndex: 7,
				},
			},
		},
		{
			Key:       "pressure",
			Name:      "应力",
			Unit:      "MPa",
			Precision: 3,
			Sort:      1,
			IsShow:    true,
			Fields: []Field{
				{
					Key:       "pressure",
					Name:      "应力",
					DataIndex: 8,
				},
			},
		},
		{
			Key:    "acceleration",
			Name:   "加速度",
			Unit:   "m/s²",
			Sort:   8,
			IsShow: false,
			Fields: []Field{
				{
					Key:       "acceleration_x",
					Name:      "X轴",
					DataIndex: 12,
				},
				{
					Key:       "acceleration_y",
					Name:      "Y轴",
					DataIndex: 13,
				},
				{
					Key:       "acceleration_z",
					Name:      "Z轴",
					DataIndex: 14,
				},
			},
		},
	}
}
