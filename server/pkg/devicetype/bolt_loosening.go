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
