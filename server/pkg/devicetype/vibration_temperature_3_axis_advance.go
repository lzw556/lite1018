package devicetype

type VibrationTemperature3AxisAdvance struct {
	SamplePeriod  Setting `json:"sample_period"`
	SampleOffset  Setting `json:"sample_offset"`
	SamplePeriod2 Setting `json:"sample_period_2"`
	SampleOffset2 Setting `json:"sample_offset_2"`
	IsEnabled2    Setting `json:"is_enabled_2"`
	Acc3IsAuto    Setting `json:"acc3_is_auto"`
	Acc3Range     Setting `json:"acc3_range"`
	Acc3Samples   Setting `json:"acc3_samples"`
	Acc3Odr       Setting `json:"acc3_odr"`
	Acc3Range2    Setting `json:"acc3_range_2"`
	Acc3Odr2      Setting `json:"acc3_odr_2"`
	Acc3Samples2  Setting `json:"acc3_samples_2"`
	Acc1Odr       Setting `json:"acc1_odr"`
	Acc1Samples   Setting `json:"acc1_samples"`
	Acc1Odr2      Setting `json:"acc1_odr_2"`
	Acc1Samples2  Setting `json:"acc1_samples_2"`
	BaseFrequency Setting `json:"base_frequency"`
}

func (VibrationTemperature3AxisAdvance) ID() uint {
	return VibrationTemperature3AxisAdvancedType
}

func (VibrationTemperature3AxisAdvance) SensorID() uint {
	return VibrationRmsFFTXYZTemperatureSensor
}

func (d VibrationTemperature3AxisAdvance) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting()
	d.SampleOffset = sampleOffsetSetting()
	d.IsEnabled2 = Setting{
		Name:     "原始数据采集",
		Key:      "is_enabled_2",
		Type:     BoolValueType,
		Value:    false,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     3,
	}
	d.SamplePeriod2 = Setting{
		Name:     "原始数据采样周期",
		Key:      "sample_period_2",
		Type:     Uint32ValueType,
		Value:    1200000, // 20 minutes
		Options:  samplePeriodOption1,
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     4,
	}
	d.SampleOffset2 = Setting{
		Name:     "原始数据采样延时",
		Key:      "sample_offset_2",
		Type:     Uint32ValueType,
		Value:    10000,
		Options:  sampleOffsetOptions1,
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     5,
	}
	d.Acc3IsAuto = Setting{
		Name:     "自动增益(X,Z)",
		Key:      "acc3_is_auto",
		Type:     BoolValueType,
		Value:    true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     6,
	}
	d.Acc3Range = Setting{
		Name:  "量程(X,Z)",
		Key:   "acc3_range",
		Type:  Uint8ValueType,
		Value: 0,
		Options: map[int]string{
			0: "8g",
			1: "16g",
			2: "32g",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     7,
	}
	d.Acc3Odr = Setting{
		Name:  "采样频率(X,Z)",
		Key:   "acc3_odr",
		Type:  Uint8ValueType,
		Value: 15,
		Options: map[int]string{
			12: "3.2kHz",
			13: "6.4kHz",
			14: "12.8kHz",
			15: "25.6kHz",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     8,
	}
	d.Acc3Samples = Setting{
		Name:  "采样点数(X,Z)",
		Key:   "acc3_samples",
		Type:  Uint32ValueType,
		Value: 1024,
		Options: map[int]string{
			300:  "300",
			512:  "512",
			1024: "1024",
			2048: "2048",
			4096: "4096",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     9,
	}
	d.Acc3Range2 = Setting{
		Name:  "原始数据量程(X,Z)",
		Key:   "acc3_range_2",
		Type:  Uint8ValueType,
		Value: 2,
		Options: map[int]string{
			0: "8g",
			1: "16g",
			2: "32g",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     10,
	}
	d.Acc3Odr2 = Setting{
		Name:  "原始数据采样频率(X,Z)",
		Key:   "acc3_odr_2",
		Type:  Uint8ValueType,
		Value: 12,
		Options: map[int]string{
			12: "3.2kHz",
			13: "6.4kHz",
			14: "12.8kHz",
			15: "25.6kHz",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     11,
	}
	d.Acc3Samples2 = Setting{
		Name:  "原始数据采样时间(X,Z)",
		Key:   "acc3_samples_2",
		Type:  Uint32ValueType,
		Value: 10000,
		Options: map[int]string{
			100:   "0.1秒",
			500:   "0.5秒",
			1000:  "1秒",
			1500:  "1.5秒",
			2000:  "2秒",
			3000:  "3秒",
			5000:  "5秒",
			10000: "10秒",
			20000: "20秒",
			25000: "25秒",
			30000: "30秒",
			60000: "60秒",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     12,
	}
	d.Acc1Odr = Setting{
		Name:  "采样频率(Y)",
		Key:   "acc1_odr",
		Type:  Uint8ValueType,
		Value: 5,
		Options: map[int]string{
			0: "4KHz",
			1: "8KHz",
			2: "16KHz",
			3: "25.6KHz",
			4: "32KHz",
			5: "64KHz",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     13,
	}
	d.Acc1Samples = Setting{
		Name:  "采样点数(Y)",
		Key:   "acc1_samples",
		Type:  Uint32ValueType,
		Value: 2048,
		Options: map[int]string{
			2048: "2048",
			4096: "4096",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     14,
	}
	d.Acc1Odr2 = Setting{
		Name:  "原始数据采样频率(Y)",
		Key:   "acc1_odr_2",
		Type:  Uint8ValueType,
		Value: 5,
		Options: map[int]string{
			0: "4KHz",
			1: "8KHz",
			2: "16KHz",
			3: "25.6KHz",
			4: "32KHz",
			5: "64KHz",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     15,
	}
	d.Acc1Samples2 = Setting{
		Name:  "原始数据采样时间(Y)",
		Key:   "acc1_samples_2",
		Type:  Uint32ValueType,
		Value: 10000,
		Options: map[int]string{
			100:   "0.1秒",
			500:   "0.5秒",
			1000:  "1秒",
			1500:  "1.5秒",
			2000:  "2秒",
			3000:  "3秒",
			5000:  "5秒",
			10000: "10秒",
			20000: "20秒",
			25000: "25秒",
			30000: "30秒",
			60000: "60秒",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     16,
	}
	d.BaseFrequency = Setting{
		Name:     "FFT运算基础频率",
		Key:      "base_frequency",
		Type:     FloatValueType,
		Value:    0,
		Unit:     "Hz",
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     17,
	}

	return []Setting{
		d.SamplePeriod,
		d.SampleOffset,
		d.SamplePeriod2,
		d.SampleOffset2,
		d.IsEnabled2,
		d.Acc3IsAuto,
		d.Acc3Range,
		d.Acc3Samples,
		d.Acc3Odr,
		d.Acc3Range2,
		d.Acc3Odr2,
		d.Acc3Samples2,
		d.Acc1Odr,
		d.Acc1Samples,
		d.Acc1Odr2,
		d.Acc1Samples2,
		d.BaseFrequency,
	}
}

func (d VibrationTemperature3AxisAdvance) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
