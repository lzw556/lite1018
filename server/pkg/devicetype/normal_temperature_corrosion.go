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
			Key:      "schedule0_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    6000,
			Category: SensorsSettingCategory,
			Sort:     1,
		},
		{
			Name:     "时间偏移量",
			Key:      "tof_offset",
			Type:     FloatValueType,
			Value:    688.0,
			Category: SensorsSettingCategory,
			Unit:     "ns",
			Sort:     2,
		},
		{
			Name:     "扫描模式",
			Key:      "scan_mode",
			Type:     Uint8ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
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
				},
			},
			{
				Key:       "tof",
				Name:      "飞行时间",
				Unit:      "ns",
				Precision: 3,
				Sort:      3,
				Fields: []Field{
					{
						Name:      "飞行时间",
						Key:       "tof",
						DataIndex: 3,
					},
				},
			},
		}
	}
	return nil
}
