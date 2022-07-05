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
	switch sensorID {
	case VibrationRmsFFTXYZTemperatureSensor:
		return Properties{
			{
				Key:       "vibration_severity",
				Name:      "速度有效值",
				Unit:      "mm/s",
				Precision: 3,
				Sort:      0,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "vibration_severity_x",
						DataIndex: 7,
					},
					{
						Name:      "Y轴",
						Key:       "vibration_severity_y",
						DataIndex: 8,
					},
					{
						Name:      "Z轴",
						Key:       "vibration_severity_z",
						DataIndex: 9,
					},
				},
			},
			{
				Key:       "enveloping_pk2pk",
				Name:      "加速度包络",
				Unit:      "gE",
				Precision: 3,
				Sort:      1,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "enveloping_pk2pk_x",
						DataIndex: 13,
					},
					{
						Name:      "Y轴",
						Key:       "enveloping_pk2pk_y",
						DataIndex: 14,
					},
					{
						Name:      "Z轴",
						Key:       "enveloping_pk2pk_z",
						DataIndex: 15,
					},
				},
			},
			{
				Key:       "acceleration_peak",
				Name:      "加速度峰值",
				Unit:      "m/s²",
				Precision: 3,
				Sort:      2,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "acceleration_peak_x",
						DataIndex: 19,
					},
					{
						Name:      "Y轴",
						Key:       "acceleration_peak_y",
						DataIndex: 20,
					},
					{
						Name:      "Z轴",
						Key:       "acceleration_peak_z",
						DataIndex: 21,
					},
				},
			},
			{
				Key:       "temperature",
				Name:      "温度",
				Unit:      "°C",
				Precision: 3,
				Sort:      3,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "温度",
						Key:       "temperature",
						DataIndex: 0,
					},
				},
			},
			{
				Key:       "fft_frequency",
				Name:      "频率",
				Unit:      "Hz",
				Precision: 3,
				Sort:      4,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_frequency_x",
						DataIndex: 61,
					},
					{
						Name:      "Y轴",
						Key:       "fft_frequency_y",
						DataIndex: 62,
					},
					{
						Name:      "Z轴",
						Key:       "fft_frequency_z",
						DataIndex: 63,
					},
				},
			},
			{
				Key:       "displacement_peak_difference",
				Name:      "位移峰峰值",
				Unit:      "μm",
				Precision: 3,
				Sort:      5,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "displacement_peak_difference_x",
						DataIndex: 22,
					},
					{
						Name:      "Y轴",
						Key:       "displacement_peak_difference_y",
						DataIndex: 23,
					},
					{
						Name:      "Z轴",
						Key:       "displacement_peak_difference_z",
						DataIndex: 24,
					},
				},
			},
			{
				Key:       "acceleration_rms",
				Name:      "加速度有效值",
				Unit:      "m/s²",
				Precision: 3,
				Sort:      6,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "acceleration_rms_x",
						DataIndex: 4,
					},
					{
						Name:      "Y轴",
						Key:       "acceleration_rms_y",
						DataIndex: 5,
					},
					{
						Name:      "Z轴",
						Key:       "acceleration_rms_z",
						DataIndex: 6,
					},
				},
			},
			{
				Key:       "crest_factor",
				Name:      "波峰因子",
				Unit:      "",
				Precision: 3,
				Sort:      7,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "crest_factor_x",
						DataIndex: 16,
					},
					{
						Name:      "Y轴",
						Key:       "crest_factor_y",
						DataIndex: 17,
					},
					{
						Name:      "Z轴",
						Key:       "crest_factor_z",
						DataIndex: 18,
					},
				},
			},
			{
				Key:       "pulse_factor",
				Name:      "脉冲因子",
				Unit:      "",
				Precision: 3,
				Sort:      8,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "pulse_factor_x",
						DataIndex: 40,
					},
					{
						Name:      "Y轴",
						Key:       "pulse_factor_y",
						DataIndex: 41,
					},
					{
						Name:      "Z轴",
						Key:       "pulse_factor_z",
						DataIndex: 42,
					},
				},
			},
			{
				Key:       "margin_factor",
				Name:      "裕度因子",
				Unit:      "",
				Precision: 3,
				Sort:      9,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "margin_factor_x",
						DataIndex: 37,
					},
					{
						Name:      "Y轴",
						Key:       "margin_factor_y",
						DataIndex: 38,
					},
					{
						Name:      "Z轴",
						Key:       "margin_factor_z",
						DataIndex: 39,
					},
				},
			},
			{
				Key:       "kurtosis",
				Name:      "峭度",
				Unit:      "",
				Precision: 3,
				Sort:      10,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "kurtosis_x",
						DataIndex: 25,
					},
					{
						Name:      "Y轴",
						Key:       "kurtosis_y",
						DataIndex: 26,
					},
					{
						Name:      "Z轴",
						Key:       "kurtosis_z",
						DataIndex: 27,
					},
				},
			},
			{
				Key:       "kurtosis_norm",
				Name:      "峭度指标",
				Unit:      "",
				Precision: 3,
				Sort:      11,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "kurtosis_norm_x",
						DataIndex: 28,
					},
					{
						Name:      "Y轴",
						Key:       "kurtosis_norm_y",
						DataIndex: 29,
					},
					{
						Name:      "Z轴",
						Key:       "kurtosis_norm_z",
						DataIndex: 30,
					},
				},
			},
			{
				Key:       "skewness",
				Name:      "歪度",
				Unit:      "",
				Precision: 3,
				Sort:      12,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "skewness_x",
						DataIndex: 31,
					},
					{
						Name:      "Y轴",
						Key:       "skewness_y",
						DataIndex: 32,
					},
					{
						Name:      "Z轴",
						Key:       "skewness_z",
						DataIndex: 33,
					},
				},
			},
			{
				Key:       "skewness_norm",
				Name:      "歪度指标",
				Unit:      "",
				Precision: 3,
				Sort:      13,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "skewness_norm_x",
						DataIndex: 34,
					},
					{
						Name:      "Y轴",
						Key:       "skewness_norm_y",
						DataIndex: 35,
					},
					{
						Name:      "Z轴",
						Key:       "skewness_norm_z",
						DataIndex: 36,
					},
				},
			},
			{
				Key:       "fft_value_1",
				Name:      "一倍频",
				Unit:      "",
				Precision: 3,
				Sort:      14,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_value_1_x",
						DataIndex: 58,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_1_y",
						DataIndex: 59,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_1_z",
						DataIndex: 60,
					},
				},
			},
			{
				Key:       "fft_value_2",
				Name:      "二倍频",
				Unit:      "",
				Precision: 3,
				Sort:      14,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_value_2_x",
						DataIndex: 64,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_2_y",
						DataIndex: 65,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_2_z",
						DataIndex: 66,
					},
				},
			},
			{
				Key:       "fft_value_3",
				Name:      "三倍频",
				Unit:      "",
				Precision: 3,
				Sort:      15,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_value_3_x",
						DataIndex: 70,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_3_y",
						DataIndex: 71,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_3_z",
						DataIndex: 72,
					},
				},
			},
			{
				Key:       "fft_value_0",
				Name:      "半倍频",
				Unit:      "",
				Precision: 3,
				Sort:      16,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_value_0_x",
						DataIndex: 52,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_0_y",
						DataIndex: 53,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_0_z",
						DataIndex: 54,
					},
				},
			},
			{
				Key:       "spectrum_variance",
				Name:      "谱方差",
				Unit:      "",
				Precision: 3,
				Sort:      17,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "spectrum_variance_x",
						DataIndex: 43,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_variance_y",
						DataIndex: 44,
					},
					{
						Name:      "Z轴",
						Key:       "spectrum_variance_z",
						DataIndex: 45,
					},
				},
			},
			{
				Key:       "spectrum_mean",
				Name:      "谱均值",
				Unit:      "",
				Precision: 3,
				Sort:      18,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "spectrum_mean_x",
						DataIndex: 46,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_mean_y",
						DataIndex: 47,
					},
					{
						Name:      "Z轴",
						Key:       "spectrum_mean_z",
						DataIndex: 48,
					},
				},
			},
			{
				Key:       "spectrum_rms",
				Name:      "谱有效值",
				Unit:      "",
				Precision: 3,
				Sort:      19,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "spectrum_rms_x",
						DataIndex: 49,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_rms_y",
						DataIndex: 50,
					},
					{
						Name:      "Z轴",
						Key:       "spectrum_rms_z",
						DataIndex: 51,
					},
				},
			},
			{
				Key:       "inclination",
				Name:      "倾斜角",
				Unit:      "°",
				Precision: 3,
				Sort:      20,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "倾斜角",
						Key:       "inclination",
						DataIndex: 1,
					},
				},
			},
			{
				Name:      "俯仰角",
				Key:       "pitch",
				Unit:      "°",
				Precision: 3,
				Sort:      21,
				Fields: []Field{
					{
						Name:      "俯仰角",
						Key:       "pitch",
						DataIndex: 2,
					},
				},
			},
			{
				Name:      "翻滚角",
				Key:       "roll",
				Unit:      "°",
				Precision: 3,
				Sort:      22,
				Fields: []Field{
					{
						Name:      "翻滚角",
						Key:       "roll",
						DataIndex: 3,
					},
				},
			},
			{
				Name:      "位移",
				Key:       "displacement",
				Unit:      "μm",
				Precision: 3,
				Sort:      23,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "displacement_x",
						DataIndex: 10,
					},
					{
						Name:      "Y轴",
						Key:       "displacement_y",
						DataIndex: 11,
					},
					{
						Name:      "Z轴",
						Key:       "displacement_z",
						DataIndex: 12,
					},
				},
			},
			{
				Key:       "acc_var",
				Name:      "方差",
				Unit:      "",
				Precision: 3,
				Sort:      24,
				IsShow:    true,
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "acc_var_x",
						DataIndex: 76,
					},
					{
						Name:      "Y轴",
						Key:       "acc_var_y",
						DataIndex: 77,
					},
					{
						Name:      "Z轴",
						Key:       "acc_var_z",
						DataIndex: 78,
					},
				},
			},
		}
	}
	return nil
}
