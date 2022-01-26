package devicetype

type AngleDip struct{}

func (AngleDip) ID() uint {
	return AngleDipType
}

func (AngleDip) SensorID() uint {
	return SCL3300Sensor
}

func (AngleDip) Settings() Settings {
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

func (d AngleDip) Properties(sensorID uint) Properties {
	switch sensorID {
	case SCL3300Sensor:
		return Properties{
			{
				Name:        "倾斜角",
				Key:         "inclination",
				Type:        FloatPropertyType,
				Unit:        "°",
				Precision:   3,
				Sort:        0,
				DataIndexes: []uint{0},
			},
			{
				Name:        "俯仰角",
				Key:         "pitch",
				Type:        FloatPropertyType,
				Unit:        "°",
				Precision:   3,
				Sort:        1,
				DataIndexes: []uint{1},
			},
			{
				Name:        "翻滚角",
				Key:         "roll",
				Type:        FloatPropertyType,
				Unit:        "°",
				Precision:   3,
				Sort:        2,
				DataIndexes: []uint{2},
			},
		}
	}
	return nil
}
