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
			Key:      "schedule0_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Sort:     0,
			Options:  samplePeriodOption1,
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
			Name:     "超声波扫描模式",
			Key:      "scan_mode",
			Type:     Uint8ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
			Sort:     3,
		},
		{
			Name:     "是否启用预紧力计算",
			Key:      "pretightening_is_enabled",
			Type:     BoolValueType,
			Value:    true, // true - enabled, false - disabled
			Category: SensorsSettingCategory,
			Sort:     4,
		},
		{
			Name:     "初始预紧力",
			Key:      "initial_pretightening_force",
			Type:     FloatValueType,
			Value:    0.0,
			Category: SensorsSettingCategory,
			Unit:     "kN",
			Sort:     5,
			Show:     true,
			Parent:   "pretightening_is_enabled",
		},
		{
			Name:     "初始预紧长度",
			Key:      "initial_pretightening_length",
			Type:     FloatValueType,
			Value:    0.0,
			Category: SensorsSettingCategory,
			Unit:     "mm",
			Sort:     6,
			Show:     true,
			Parent:   "pretightening_is_enabled",
		},
		{
			Name:     "预紧系数",
			Key:      "pretightening_k",
			Type:     FloatValueType,
			Value:    1.0,
			Category: SensorsSettingCategory,
			Sort:     7,
			Show:     true,
			Parent:   "pretightening_is_enabled",
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
			Parent:   "pretightening_is_enabled",
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
			Parent:   "pretightening_is_enabled",
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
			Parent:   "pretightening_is_enabled",
		},
		{
			Name:     "是否启用自动增益",
			Key:      "kx122_is_auto_gain",
			Type:     BoolValueType,
			Value:    true, // true - enabled, false - disabled
			Category: SensorsSettingCategory,
			Sort:     11,
		},
		{
			Name:     "量程",
			Key:      "kx122_range",
			Type:     Uint8ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				0: "2g",
				1: "4g",
				2: "8g",
			},
			Unit:   "g",
			Sort:   12,
			Parent: "kx122_is_auto_gain",
			Show:   false,
		},
		{
			Name:     "采样频率",
			Key:      "kx122_odr",
			Type:     Uint8ValueType,
			Value:    12,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				12: "3.2kHz",
				13: "6.4kHz",
				14: "12.8kHz",
				15: "25.6kHz",
			},
			Unit: "Hz",
			Sort: 13,
		},
		{
			Name:     "采样点数",
			Key:      "kx122_sample_number",
			Type:     Uint16ValueType,
			Value:    512,
			Category: SensorsSettingCategory,
			Sort:     14,
		},
	}
}
