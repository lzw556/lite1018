package devicetype

type VibrationTemperature3Axis struct{}

func (VibrationTemperature3Axis) ID() uint {
	return VibrationTemperature3AxisType
}

func (VibrationTemperature3Axis) SensorID() uint {
	return VibrationRmsFFTXYZTemperatureSensor
}

func (VibrationTemperature3Axis) Settings() Settings {
	return []Setting{
		{
			Name:     "采集周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
			Group:    SettingGroupGeneral,
		},
		{
			Name:  "是否启用原始数据采集",
			Key:   "sensor_flags_2",
			Type:  Uint64ValueType,
			Value: 32,
			Options: map[int]string{
				0:  "不启用",
				32: "启用",
			},
			Category: SensorsSettingCategory,
			Sort:     1,
			Group:    SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集周期",
			Key:      "sample_period_2",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Unit:     "ms",
			Sort:     2,
			Parent:   "sample_period_2",
			Show:     32,
			Group:    SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集延时",
			Key:      "sample_offset_2",
			Type:     Uint32ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
			Sort:     3,
			Options:  smaplePeriodOffsetOption1,
			Parent:   "sample_period_2",
			Show:     32,
			Group:    SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集量程",
			Key:      "acc3_range",
			Type:     Uint8ValueType,
			Value:    2,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				0: "8g",
				1: "16g",
				2: "32g",
			},
			Unit:   "g",
			Sort:   4,
			Parent: "sample_period_2",
			Show:   32,
			Group:  SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集频率",
			Key:      "acc3_odr",
			Type:     Uint8ValueType,
			Value:    12,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				12: "3.2kHz",
				13: "6.4kHz",
				14: "12.8kHz",
				15: "25.6kHz",
			},
			Unit:   "Hz",
			Sort:   5,
			Parent: "sample_period_2",
			Show:   32,
			Group:  SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采样点数",
			Key:      "acc3_samples",
			Type:     Uint32ValueType,
			Value:    1024,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				300:  "300",
				512:  "512",
				1024: "1024",
				2048: "2048",
				4096: "4096",
			},
			Sort:   6,
			Parent: "sample_period_2",
			Show:   32,
			Group:  SettingGroupAcceleration,
		},
	}
}

func (VibrationTemperature3Axis) Properties(sensorID uint) Properties {
	switch sensorID {
	case VibrationRmsFFTXYZTemperatureSensor:
		return Properties{
			{
				Key:       "vibration_severity",
				Name:      "振动烈度",
				Unit:      "mm/s",
				Precision: 3,
				Sort:      0,
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
				Fields: []Field{
					{
						Name:      "X轴",
						Key:       "fft_frequency_x",
						DataIndex: 52,
					},
					{
						Name:      "Y轴",
						Key:       "fft_frequency_y",
						DataIndex: 60,
					},
					{
						Name:      "Z轴",
						Key:       "fft_frequency_z",
						DataIndex: 68,
					},
				},
			},
			{
				Key:       "displacement_peak_difference",
				Name:      "位移峰峰值",
				Unit:      "",
				Precision: 3,
				Sort:      5,
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
				Name:      "倾角",
				Unit:      "°",
				Precision: 3,
				Sort:      20,
				Fields: []Field{
					{
						Name:      "倾角",
						Key:       "inclination",
						DataIndex: 1,
					},
				},
			},
		}
	}
	return nil
}
