package devicetype

type BoltLoosening struct{}

func (BoltLoosening) ID() uint {
	return BoltLooseningType
}

func (BoltLoosening) SensorID() uint {
	return BoltAngleSensor
}

func (BoltLoosening) Settings() Settings {
	return []Setting{
		{
			Name:     "采样周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Options:  samplePeriodOption1,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     0,
		},
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
	return nil
}
