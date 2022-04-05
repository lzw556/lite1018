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
			Name:     "采集周期",
			Key:      "schedule0_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
			Group:    SettingGroupGeneral,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    5920,
			Category: SensorsSettingCategory,
			Sort:     1,
			Group:    SettingGroupCorrosion,
		},
		{
			Name:     "导波杆长",
			Key:      "length_rod",
			Type:     FloatValueType,
			Value:    400,
			Category: SensorsSettingCategory,
			Sort:     2,
			Options: map[int]string{
				124: "124mm",
				125: "125mm",
				200: "200mm",
				300: "300mm",
				400: "400mm",
			},
			Group: SettingGroupCorrosion,
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
