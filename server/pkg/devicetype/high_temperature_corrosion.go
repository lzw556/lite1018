package devicetype

type HighTemperatureCorrosion struct {
	SamplePeriod Setting `json:"sample_period"`
	SampleOffset Setting `json:"sample_offset"`
	SpeedObject  Setting `json:"speed_object"`
	LengthRod    Setting `json:"length_rod"`
	ObjTempK1    Setting `json:"obj_temp_k1"`
	ObjTempK2    Setting `json:"obj_temp_k2"`
	RodTempK1    Setting `json:"rod_temp_k1"`
	RodTempK2    Setting `json:"rod_temp_k2"`
	RatePeriod   Setting `json:"rate_period"`
	RatePeriod2  Setting `json:"rate_period_2"`
}

func (HighTemperatureCorrosion) ID() uint {
	return HighTemperatureCorrosionType
}

func (HighTemperatureCorrosion) SensorID() uint {
	return ThicknessSensor
}

func (d HighTemperatureCorrosion) Settings() Settings {
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
	d.LengthRod = Setting{
		Name:  "导波杆长",
		Key:   "length_rod",
		Type:  FloatValueType,
		Value: 400,
		Options: map[int]string{
			124: "124mm",
			125: "125mm",
			200: "200mm",
			300: "300mm",
			400: "400mm",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupThickness,
		Sort:     3,
	}
	d.ObjTempK1 = temperatureKSetting("温度补偿系数1", "obj_temp_k1", 0, 4, SettingGroupThickness)
	d.ObjTempK2 = temperatureKSetting("温度补偿系数2", "obj_temp_k2", 0.025, 5, SettingGroupThickness)
	d.RodTempK1 = temperatureKSetting("温度补偿系数3", "rod_temp_k1", 0, 6, SettingGroupThickness)
	d.RodTempK2 = temperatureKSetting("温度补偿系数4", "rod_temp_k2", 0.078, 7, SettingGroupThickness)
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
		Sort:     9,
	}
	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
		d.SpeedObject,
		d.LengthRod,
		d.ObjTempK1,
		d.ObjTempK2,
		d.RodTempK1,
		d.RodTempK2,
		d.RatePeriod,
		d.RatePeriod2,
	}
}

func (HighTemperatureCorrosion) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
