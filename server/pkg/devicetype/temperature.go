package devicetype

type Temperature struct {
	SamplePeriod Setting `json:"sample_period"`
	SampleOffset Setting `json:"sample_offset"`
}

func (Temperature) ID() uint {
	return TemperatureType
}

func (Temperature) SensorID() uint {
	return TempMAX31865
}

func (d Temperature) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting()
	d.SampleOffset = sampleOffsetSetting()
	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
	}
}

func (Temperature) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
