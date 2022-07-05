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
	switch sensorID {
	case ThicknessSensor:
		return Properties{
			{
				Key:       "thickness",
				Name:      "厚度",
				Unit:      "mm",
				Precision: 3,
				Sort:      0,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "厚度",
						Key:       "thickness",
						DataIndex: 0,
					},
				},
			},
			{
				Key:    "corrosion_rate",
				Name:   "腐蚀率",
				Unit:   "mm/a",
				Sort:   1,
				IsShow: true,
				Fields: []Field{
					{
						Name:      "短周期腐蚀率",
						Key:       "short_corrosion_rate",
						DataIndex: 5,
					},
					{
						Name:      "长周期腐蚀率",
						Key:       "long_corrosion_rate",
						DataIndex: 6,
					},
				},
			},
			{
				Key:       "temperature",
				Name:      "温度",
				Unit:      "°C",
				Precision: 3,
				Sort:      2,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "温度",
						Key:       "temperature",
						DataIndex: 1,
					},
					{
						Name:      "环境温度",
						Key:       "env_temperature",
						DataIndex: 3,
					},
				},
			},
			{
				Key:       "tof",
				Name:      "飞行时间",
				Unit:      "ns",
				Precision: 3,
				Sort:      4,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "飞行时间",
						Key:       "tof",
						DataIndex: 2,
					},
				},
			},
			{
				Key:       "signal_strength",
				Name:      "信号强度",
				Unit:      "",
				Precision: 3,
				Sort:      5,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "信号强度",
						Key:       "signal_strength",
						DataIndex: 4,
					},
				},
			},
			{
				Key:       "signal_quality",
				Name:      "信号质量",
				Unit:      "",
				Precision: 3,
				Sort:      6,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "信号质量",
						Key:       "signal_quality",
						DataIndex: 7,
					},
				},
			},
		}
	}
	return nil
}
