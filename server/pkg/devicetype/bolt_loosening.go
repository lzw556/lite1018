package devicetype

type BoltLoosening struct {
	SamplePeriod Setting `json:"sample_period"`
	SampleOffset Setting `json:"sample_offset"`
}

func (BoltLoosening) ID() uint {
	return BoltLooseningType
}

func (BoltLoosening) SensorID() uint {
	return BoltAngleSensor
}

func (d BoltLoosening) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting()
	d.SampleOffset = sampleOffsetSetting()
	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
	}
}

func (BoltLoosening) Properties(sensorID uint) Properties {
	switch sensorID {
	case BoltAngleSensor:
		return Properties{
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
	return nil
}
