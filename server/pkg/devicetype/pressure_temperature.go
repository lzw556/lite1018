package devicetype

type PressureTemperature struct {
	SamplePeriod Setting `json:"sample_period"`
	SampleOffset Setting `json:"sample_offset"`
}

func (d PressureTemperature) ID() uint {
	return PressureTemperatureType
}

func (d PressureTemperature) SensorID() uint {
	return PressureTemperatureSensor
}

func (d PressureTemperature) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting(0)
	d.SampleOffset = sampleOffsetSetting(1)
	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
	}
}

func (d PressureTemperature) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
