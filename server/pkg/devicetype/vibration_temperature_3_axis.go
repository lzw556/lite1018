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
			Key:      "schedule0_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
			Group:    SettingGroupGeneral,
		},
		{
			Name:  "是否启用原始数据采集",
			Key:   "schedule1_sensor_flags",
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
			Key:      "schedule1_sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Unit:     "ms",
			Sort:     2,
			Parent:   "schedule1_sensor_flags",
			Show:     32,
			Group:    SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集延时",
			Key:      "schedule1_sample_time_offset",
			Type:     Uint32ValueType,
			Value:    0,
			Category: SensorsSettingCategory,
			Sort:     3,
			Options:  smaplePeriodOffsetOption1,
			Parent:   "schedule1_sensor_flags",
			Show:     32,
			Group:    SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集量程",
			Key:      "kx122_continuous_range",
			Type:     Uint8ValueType,
			Value:    2,
			Category: SensorsSettingCategory,
			Options: map[int]string{
				0: "2g",
				1: "4g",
				2: "8g",
			},
			Unit:   "g",
			Sort:   4,
			Parent: "schedule1_sensor_flags",
			Show:   32,
			Group:  SettingGroupAcceleration,
		},
		{
			Name:     "原始数据采集频率",
			Key:      "kx122_continuous_odr",
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
			Parent: "schedule1_sensor_flags",
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
						DataIndex: 1,
					},
					{
						Name:      "Y轴",
						Key:       "vibration_severity_y",
						DataIndex: 17,
					},
					{
						Name:      "Z轴",
						Key:       "vibration_severity_z",
						DataIndex: 33,
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
						DataIndex: 3,
					},
					{
						Name:      "Y轴",
						Key:       "enveloping_pk2pk_y",
						DataIndex: 19,
					},
					{
						Name:      "Z轴",
						Key:       "enveloping_pk2pk_z",
						DataIndex: 35,
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
						DataIndex: 5,
					},
					{
						Name:      "Y轴",
						Key:       "acceleration_peak_y",
						DataIndex: 21,
					},
					{
						Name:      "Z轴",
						Key:       "acceleration_peak_z",
						DataIndex: 37,
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
						DataIndex: 73,
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
						DataIndex: 6,
					},
					{
						Name:      "Y轴",
						Key:       "displacement_peak_difference_y",
						DataIndex: 22,
					},
					{
						Name:      "Z轴",
						Key:       "displacement_peak_difference_z",
						DataIndex: 38,
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
						DataIndex: 0,
					},
					{
						Name:      "Y轴",
						Key:       "acceleration_rms_y",
						DataIndex: 16,
					},
					{
						Name:      "Z轴",
						Key:       "acceleration_rms_z",
						DataIndex: 32,
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
						DataIndex: 4,
					},
					{
						Name:      "Y轴",
						Key:       "crest_factor_y",
						DataIndex: 20,
					},
					{
						Name:      "Z轴",
						Key:       "crest_factor_z",
						DataIndex: 36,
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
						DataIndex: 12,
					},
					{
						Name:      "Y轴",
						Key:       "pulse_factor_y",
						DataIndex: 28,
					},
					{
						Name:      "Z轴",
						Key:       "pulse_factor_z",
						DataIndex: 44,
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
						DataIndex: 11,
					},
					{
						Name:      "Y轴",
						Key:       "margin_factor_y",
						DataIndex: 27,
					},
					{
						Name:      "Z轴",
						Key:       "margin_factor_z",
						DataIndex: 43,
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
						DataIndex: 7,
					},
					{
						Name:      "Y轴",
						Key:       "kurtosis_y",
						DataIndex: 23,
					},
					{
						Name:      "Z轴",
						Key:       "kurtosis_z",
						DataIndex: 39,
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
						DataIndex: 8,
					},
					{
						Name:      "Y轴",
						Key:       "kurtosis_norm_y",
						DataIndex: 24,
					},
					{
						Name:      "Z轴",
						Key:       "kurtosis_norm_z",
						DataIndex: 40,
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
						DataIndex: 9,
					},
					{
						Name:      "Y轴",
						Key:       "skewness_y",
						DataIndex: 25,
					},
					{
						Name:      "Z轴",
						Key:       "skewness_z",
						DataIndex: 41,
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
						DataIndex: 10,
					},
					{
						Name:      "Y轴",
						Key:       "skewness_norm_y",
						DataIndex: 26,
					},
					{
						Name:      "Z轴",
						Key:       "skewness_norm_z",
						DataIndex: 42,
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
						DataIndex: 51,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_1_y",
						DataIndex: 59,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_1_z",
						DataIndex: 67,
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
						DataIndex: 53,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_2_y",
						DataIndex: 61,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_2_z",
						DataIndex: 69,
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
						DataIndex: 55,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_3_y",
						DataIndex: 63,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_3_z",
						DataIndex: 71,
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
						DataIndex: 49,
					},
					{
						Name:      "Y轴",
						Key:       "fft_value_0_y",
						DataIndex: 57,
					},
					{
						Name:      "Z轴",
						Key:       "fft_value_0_z",
						DataIndex: 65,
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
						DataIndex: 13,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_variance_y",
						DataIndex: 29,
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
						DataIndex: 14,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_mean_y",
						DataIndex: 30,
					},
					{
						Name:      "Z轴",
						Key:       "spectrum_mean_z",
						DataIndex: 46,
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
						DataIndex: 15,
					},
					{
						Name:      "Y轴",
						Key:       "spectrum_rms_y",
						DataIndex: 31,
					},
					{
						Name:      "Z轴",
						Key:       "spectrum_rms_z",
						DataIndex: 47,
					},
				},
			},
			{
				Key:       "inclination",
				Name:      "倾角",
				Unit:      "",
				Precision: 3,
				Sort:      20,
				Fields: []Field{
					{
						Name:      "倾角",
						Key:       "inclination",
						DataIndex: 48,
					},
				},
			},
		}
	}
	return nil
}
