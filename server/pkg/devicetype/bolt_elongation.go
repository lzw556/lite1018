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
			Name:     "采样周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Options:  samplePeriodOption1,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     0,
		},
		{
			Name:  "采样模式",
			Key:   "sensor_flags",
			Type:  Uint64ValueType,
			Value: 1,
			Options: map[int]string{
				1: "静态模式",
				2: "动态模式",
			},
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     1,
		},
		{
			Name:     "波速",
			Key:      "speed_object",
			Type:     FloatValueType,
			Value:    5920,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     2,
		},
		{
			Name:  "超声波扫描模式",
			Key:   "scan_mode",
			Type:  Uint8ValueType,
			Value: 0, Options: map[int]string{
				0: "非大孔螺栓",
				3: "大孔螺栓",
			},
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     3,
		},
		{
			Name:     "是否启用预紧力计算",
			Key:      "preload_is_enabled",
			Type:     BoolValueType,
			Value:    true, // true - enabled, false - disabled
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     4,
		},
		{
			Name:     "初始预紧力",
			Key:      "initial_preload",
			Type:     FloatValueType,
			Value:    0.0,
			Unit:     "kN",
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     5,
		},
		{
			Name:     "初始预紧长度",
			Key:      "initial_length",
			Type:     FloatValueType,
			Value:    0.0,
			Unit:     "mm",
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     6,
		},
		{
			Name:     "预紧系数",
			Key:      "preload_coef",
			Type:     FloatValueType,
			Value:    1.0,
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     7,
		},
		{
			Name:     "弹性模量",
			Key:      "elastic_modulus",
			Type:     FloatValueType,
			Value:    210.0,
			Unit:     "Gpa",
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     8,
		},
		{
			Name:     "截面积",
			Key:      "sectional_area",
			Type:     FloatValueType,
			Value:    1305.462,
			Unit:     "mm^2",
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     9,
		},
		{
			Name:     "有效受力长度",
			Key:      "clamped_length",
			Type:     FloatValueType,
			Value:    215.0,
			Unit:     "mm",
			Parent:   "preload_is_enabled",
			Show:     true,
			Category: SensorsSettingCategory,
			Group:    SettingGroupPreload,
			Sort:     10,
		},
		{
			Name:  "动态模式采样频率",
			Key:   "odr",
			Type:  Uint16ValueType,
			Value: 1,
			Options: map[int]string{
				0: "10Hz",
				1: "20Hz",
				2: "40Hz",
				3: "80Hz",
			},
			Parent:   "sensor_flags",
			Show:     2,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     11,
		},
		{
			Name:  "动态模式采样时间",
			Key:   "samples",
			Type:  Uint32ValueType,
			Value: 16000,
			Options: map[int]string{
				1000:  "1秒",
				2000:  "2秒",
				4000:  "4秒",
				8000:  "8秒",
				16000: "16秒",
			},
			Parent:   "sensor_flags",
			Show:     2,
			Category: SensorsSettingCategory,
			Group:    SettingGroupGeneral,
			Sort:     12,
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
