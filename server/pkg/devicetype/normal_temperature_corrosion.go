package devicetype

type NormalTemperatureCorrosion struct {
	SamplePeriod Setting `json:"sample_period"`
	SampleOffset Setting `json:"sample_offset"`
	SpeedObject  Setting `json:"speed_object"`
	ObjTempK1    Setting `json:"obj_temp_k1"`
	ObjTempK2    Setting `json:"obj_temp_k2"`
	RodTempK1    Setting `json:"rod_temp_k1"`
	RodTempK2    Setting `json:"rod_temp_k2"`
	RatePeriod   Setting `json:"rate_period"`
	RatePeriod2  Setting `json:"rate_period_2"`
}

func (NormalTemperatureCorrosion) ID() uint {
	return NormalTemperatureCorrosionType
}

func (NormalTemperatureCorrosion) SensorID() uint {
	return ThicknessSensor
}

func (d NormalTemperatureCorrosion) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting()
	d.SampleOffset = sampleOffsetSetting()
	d.SpeedObject = Setting{
		Name:     "波速",
		Key:      "speed_object",
		Type:     FloatValueType,
		Value:    5920,
		Category: SensorsSettingCategory,
		Group:    SettingGroupThickness,
		Sort:     2,
	}
	d.ObjTempK1 = temperatureKSetting("温度补偿系数1", "obj_temp_k1", 0, 3, SettingGroupThickness)
	d.ObjTempK2 = temperatureKSetting("温度补偿系数2", "obj_temp_k2", 0.025, 4, SettingGroupThickness)
	d.RodTempK1 = temperatureKSetting("温度补偿系数3", "odr_temp_k1", 0, 5, SettingGroupThickness)
	d.RodTempK2 = temperatureKSetting("温度补偿系数4", "odr_temp_k2", 0.078, 6, SettingGroupThickness)
	d.RatePeriod = Setting{
		Name:     "腐蚀率短周期",
		Key:      "rate_period",
		Type:     Uint16ValueType,
		Value:    30,
		Unit:     "天",
		Category: SensorsSettingCategory,
		Group:    SettingGroupThickness,
		Sort:     8,
	}
	d.RatePeriod2 = Setting{
		Name:     "腐蚀率长周期",
		Key:      "rate_period_2",
		Type:     Uint16ValueType,
		Value:    365,
		Unit:     "天",
		Category: SensorsSettingCategory,
		Group:    SettingGroupThickness,
		Sort:     5,
	}

	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
		d.SpeedObject,
		d.ObjTempK1,
		d.ObjTempK2,
		d.RodTempK1,
		d.RodTempK2,
		d.RatePeriod,
		d.RatePeriod2,
	}
}

func (NormalTemperatureCorrosion) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
