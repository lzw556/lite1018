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
			Key:      "sample_period",
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
				Name:      "倾斜角",
				Key:       "inclination",
				Unit:      "°",
				Precision: 3,
				Sort:      0,
				Fields: []Field{
					{
						Name:      "倾斜角",
						Key:       "inclination",
						DataIndex: 0,
					},
				},
			},
			{
				Name:      "俯仰角",
				Key:       "pitch",
				Unit:      "°",
				Precision: 3,
				Sort:      1,
				Fields: []Field{
					{
						Name:      "俯仰角",
						Key:       "pitch",
						DataIndex: 1,
					},
				},
			},
			{
				Name:      "翻滚角",
				Key:       "roll",
				Unit:      "°",
				Precision: 3,
				Sort:      2,
				Fields: []Field{
					{
						Name:      "翻滚角",
						Key:       "roll",
						DataIndex: 2,
					},
				},
			},
		}
	}
	return nil
}
