package devicetype

type BoltElongation struct{}

func (BoltElongation) ID() uint {
	return BoltElongationType
}

func (BoltElongation) SensorID() uint {
	return LengthAttitudeAccelerationSensor
}

func (BoltElongation) Settings() Settings {
	return []Setting{
		{
			Name:     "采集周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Sort:     0,
			Options:  samplePeriodOption1,
			Group:    SettingGroupGeneral,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    5920,
			Category: SensorsSettingCategory,
			Sort:     1,
			Group:    SettingGroupPreload,
		},
		//{
		//	Name:     "时间偏移量",
		//	Key:      "tof_offset",
		//	Type:     FloatValueType,
		//	Value:    688.0,
		//	Category: SensorsSettingCategory,
		//	Unit:     "ns",
		//	Sort:     2,
		//},
		{
			Name:     "超声波扫描模式",
			Key:      "scan_mode",
			Type:     Uint8ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
			Sort:     3,
			Group:    SettingGroupPreload,
		},
		{
			Name:     "是否启用预紧力计算",
			Key:      "preload_is_enabled",
			Type:     BoolValueType,
			Value:    true, // true - enabled, false - disabled
			Category: SensorsSettingCategory,
			Sort:     4,
			Group:    SettingGroupPreload,
		},
		{
			Name:     "初始预紧力",
			Key:      "initial_preload",
			Type:     FloatValueType,
			Value:    0.0,
			Category: SensorsSettingCategory,
			Unit:     "kN",
			Sort:     5,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
		{
			Name:     "初始预紧长度",
			Key:      "initial_length",
			Type:     FloatValueType,
			Value:    0.0,
			Category: SensorsSettingCategory,
			Unit:     "mm",
			Sort:     6,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
		{
			Name:     "预紧系数",
			Key:      "preload_coef",
			Type:     FloatValueType,
			Value:    1.0,
			Category: SensorsSettingCategory,
			Sort:     7,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
		{
			Name:     "弹性模量",
			Key:      "elastic_modulus",
			Type:     FloatValueType,
			Value:    210.0,
			Category: SensorsSettingCategory,
			Unit:     "Gpa",
			Sort:     8,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
		{
			Name:     "截面积",
			Key:      "sectional_area",
			Type:     FloatValueType,
			Value:    1305.462,
			Category: SensorsSettingCategory,
			Unit:     "mm^2",
			Sort:     9,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
		{
			Name:     "有效受力长度",
			Key:      "clamped_length",
			Type:     FloatValueType,
			Value:    215.0,
			Category: SensorsSettingCategory,
			Unit:     "mm",
			Sort:     10,
			Show:     true,
			Parent:   "preload_is_enabled",
			Group:    SettingGroupPreload,
		},
	}
}

func (BoltElongation) Properties(sensorID uint) Properties {
	switch sensorID {
	case LengthAttitudeAccelerationSensor:
		return Properties{
			{
				Key:       "preload",
				Name:      "预紧力",
				Unit:      "kN",
				Precision: 3,
				Sort:      0,
				Fields: []Field{
					{
						Name:      "预紧力",
						Key:       "preload",
						DataIndex: 5,
					},
				},
			},
			{
				Key:       "temperature",
				Name:      "温度",
				Unit:      "°C",
				Precision: 3,
				Sort:      1,
				Fields: []Field{
					{
						Name:      "温度",
						Key:       "temperature",
						DataIndex: 1,
					},
				},
			},
			{
				Key:       "length",
				Name:      "长度",
				Unit:      "mm",
				Precision: 3,
				Sort:      2,
				Fields: []Field{
					{
						Name:      "长度",
						Key:       "length",
						DataIndex: 0,
					},
				},
			},
			{
				Key:       "defect",
				Name:      "缺陷位置",
				Unit:      "mm",
				Precision: 3,
				Sort:      3,
				Fields: []Field{
					{
						Name:      "缺陷位置",
						Key:       "defect",
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
