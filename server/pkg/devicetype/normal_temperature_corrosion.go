package devicetype

type NormalTemperatureCorrosion struct{}

func (NormalTemperatureCorrosion) ID() uint {
	return NormalTemperatureCorrosionType
}

func (NormalTemperatureCorrosion) SensorID() uint {
	return ThicknessSensor
}

func (NormalTemperatureCorrosion) Settings() Settings {
	return []Setting{
		{
			Name:     "采集周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Options:  samplePeriodOption1,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     0,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    6000,
			Category: SensorsSettingCategory,
			Group:    SettingGroupCorrosion,
			Sort:     1,
		},
		{
			Name:     "腐蚀率短周期",
			Key:      "rate_period",
			Type:     Uint16ValueType,
			Value:    30,
			Unit:     "天",
			Category: SensorsSettingCategory,
			Group:    SettingGroupCorrosion,
			Sort:     2,
		},
		{
			Name:     "腐蚀率长周期",
			Key:      "rate_period_2",
			Type:     Uint16ValueType,
			Value:    365,
			Unit:     "天",
			Category: SensorsSettingCategory,
			Group:    SettingGroupCorrosion,
			Sort:     3,
		},
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
