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
			Name:     "采集周期",
			Key:      "schedule0_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
		},
	}
}

func (BoltLoosening) Properties(sensorID uint) Properties {
	switch sensorID {
	case BoltAngleSensor:
		return Properties{
			{
				Key:         "loosening_angle",
				Name:        "松动角度",
				Unit:        "°",
				Precision:   3,
				Type:        FloatPropertyType,
				Sort:        0,
				DataIndexes: []uint{0},
			},
			{
				Key:         "attitude",
				Name:        "姿态指数",
				Unit:        "",
				Type:        FloatPropertyType,
				Precision:   3,
				Sort:        1,
				DataIndexes: []uint{8},
			},
			{
				Key:         "motion",
				Name:        "移动指数",
				Unit:        "",
				Type:        FloatPropertyType,
				Precision:   3,
				Sort:        2,
				DataIndexes: []uint{5},
			},
		}
	}
	return nil
}
