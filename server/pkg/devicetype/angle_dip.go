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
