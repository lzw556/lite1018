package devicetype

type HighTemperatureCorrosion struct {
}

func (HighTemperatureCorrosion) ID() uint {
	return HighTemperatureCorrosionType
}

func (HighTemperatureCorrosion) SensorID() uint {
	return ThicknessSensor
}

func (HighTemperatureCorrosion) Settings() Settings {
	return []Setting{
		{
			Name:     "采样周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Options:  samplePeriodOption1,
			Group:    SettingGroupGeneral,
			Category: SensorsSettingCategory,
			Sort:     0,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    5920,
			Category: SensorsSettingCategory,
			Group:    SettingGroupCorrosion,
			Sort:     1,
		},
		{
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
			Group:    SettingGroupCorrosion,
			Sort:     2,
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

func (HighTemperatureCorrosion) Properties(sensorID uint) Properties {
	switch sensorID {
	case ThicknessSensor:
		return Properties{
			{
				Key:       "thickness",
				Name:      "厚度",
				Unit:      "mm",
				Precision: 3,
				Sort:      0,
				Fields: []Field{
					{
						Name:      "厚度",
						Key:       "thickness",
						DataIndex: 0,
					},
				},
			},
			{
				Key:       "temperature",
				Name:      "温度",
				Unit:      "°C",
				Precision: 3,
				Sort:      2,
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
				Key:  "corrosion_rate",
				Name: "腐蚀率",
				Unit: "mm/a",
				Sort: 3,
				Fields: []Field{
					{
						Name:      "月腐蚀率",
						Key:       "monthly_corrosion_rate",
						DataIndex: 5,
					},
					{
						Name:      "年腐蚀率",
						Key:       "annualized_corrosion_rate",
						DataIndex: 6,
					},
				},
			},
			{
				Key:       "tof",
				Name:      "飞行时间",
				Unit:      "ns",
				Precision: 3,
				Sort:      4,
				Fields: []Field{
					{
						Name:      "飞行时间",
						Key:       "tof",
						DataIndex: 2,
					},
				},
			},
		}
	}
	return nil
}
