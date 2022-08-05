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
	d.SamplePeriod = samplePeriodSetting(0)
	d.SampleOffset = sampleOffsetSetting(1)
	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
	}
}

func (BoltLoosening) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
