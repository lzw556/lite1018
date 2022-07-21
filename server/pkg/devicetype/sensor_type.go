package devicetype

const (
	BoltAngleSensor                     = 1073938433
	ThicknessSensor                     = 1073872897
	LengthSensor                        = 1073872898
	LengthAttitudeAccelerationSensor    = 1073872899
	DynamicLengthAttitudeSensor         = 1073872901
	VibrationRmsFFTXYZTemperatureSensor = 1073807492
	VibrationRmsFFTTemperatureSensor    = 1073807490
	CurrentSensor                       = 50397185
	PressureTemperatureSensor           = 21037058
	SCL3300Sensor                       = 16842755
	DynamicSCL3300Sensor                = 16842756
	KxSensor                            = 16842753
	AdvancedKxSensor                    = 16842758
	TempMAX31865                        = 33619973
)

var properties = map[int]Properties{}

func init() {
	properties[BoltAngleSensor] = Properties{
		{
			Key:       "loosening_angle",
			Name:      "松动角度",
			Unit:      "°",
			Precision: 3,
			Sort:      0,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "松动角度",
					Key:       "loosening_angle",
					DataIndex: 0,
				},
			},
		},
		{
			Key:       "absolute_angle",
			Name:      "绝对角度",
			Unit:      "°",
			Precision: 3,
			Sort:      1,
			IsShow:    false,
			Fields: []Field{
				{
					Name:      "绝对角度",
					Key:       "absolute_angle",
					DataIndex: 1,
				},
			},
		},
		{
			Key:       "attitude",
			Name:      "姿态指数",
			Unit:      "",
			Precision: 3,
			Sort:      2,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "姿态指数",
					Key:       "attitude",
					DataIndex: 8,
				},
			},
		},
		{
			Key:       "motion",
			Name:      "移动指数",
			Unit:      "",
			Precision: 3,
			Sort:      4,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "移动指数",
					Key:       "motion",
					DataIndex: 5,
				},
			},
		},
		{
			Key:       "measurement_index",
			Name:      "测量指数",
			Unit:      "",
			Precision: 3,
			Sort:      5,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "测量指数",
					Key:       "measurement_index",
					DataIndex: 6,
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
					DataIndex: 10,
				},
			},
		},
	}
	properties[LengthAttitudeAccelerationSensor] = Properties{
		{
			Key:       "preload",
			Name:      "预紧力",
			Unit:      "kN",
			Precision: 3,
			Sort:      0,
			IsShow:    true,
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
			Sort:      3,
			IsShow:    true,
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
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "长度",
					Key:       "length",
					DataIndex: 0,
				},
			},
		},
		{
			Key:       "defect_location",
			Name:      "缺陷位置",
			Unit:      "mm",
			Precision: 3,
			Sort:      5,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "缺陷位置",
					Key:       "defect_location",
					DataIndex: 3,
				},
			},
		},
		{
			Key:       "defect_level",
			Name:      "缺陷等级",
			Unit:      "",
			Precision: 3,
			Sort:      6,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "缺陷等级",
					Key:       "defect_level",
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
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "飞行时间",
					Key:       "tof",
					DataIndex: 2,
				},
			},
		},
		{
			Key:       "signal_strength",
			Name:      "信号强度",
			Unit:      "",
			Precision: 3,
			Sort:      7,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号强度",
					Key:       "signal_strength",
					DataIndex: 4,
				},
			},
		},
		{
			Key:       "signal_quality",
			Name:      "信号质量",
			Unit:      "",
			Precision: 3,
			Sort:      8,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号质量",
					Key:       "signal_quality",
					DataIndex: 7,
				},
			},
		},
		{
			Key:       "pressure",
			Name:      "应力",
			Unit:      "MPa",
			Precision: 3,
			Sort:      1,
			IsShow:    true,
			Fields: []Field{
				{
					Key:       "pressure",
					Name:      "应力",
					DataIndex: 8,
				},
			},
		},
		{
			Key:    "acceleration",
			Name:   "加速度",
			Unit:   "m/s²",
			Sort:   8,
			IsShow: false,
			Fields: []Field{
				{
					Key:       "acceleration_x",
					Name:      "X轴",
					DataIndex: 12,
				},
				{
					Key:       "acceleration_y",
					Name:      "Y轴",
					DataIndex: 13,
				},
				{
					Key:       "acceleration_z",
					Name:      "Z轴",
					DataIndex: 14,
				},
			},
		},
	}

	properties[SCL3300Sensor] = Properties{
		{
			Name:      "倾斜角",
			Key:       "inclination",
			Unit:      "°",
			Precision: 3,
			Sort:      0,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "倾斜角",
					Key:       "inclination",
					DataIndex: 0,
				},
			},
		},
		{
			Name:      "俯仰角",
			Key:       "pitch",
			Unit:      "°",
			Precision: 3,
			Sort:      1,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "俯仰角",
					Key:       "pitch",
					DataIndex: 1,
				},
			},
		},
		{
			Name:      "翻滚角",
			Key:       "roll",
			Unit:      "°",
			Precision: 3,
			Sort:      2,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "翻滚角",
					Key:       "roll",
					DataIndex: 2,
				},
			},
		},
		{
			Key:       "waggle",
			Name:      "晃度",
			Unit:      "g",
			Precision: 3,
			Sort:      3,
			IsShow:    true,
			Fields: []Field{
				{
					Key:       "waggle",
					Name:      "晃度",
					DataIndex: 3,
				},
			},
		},
	}

	properties[ThicknessSensor] = Properties{
		{
			Key:       "thickness",
			Name:      "厚度",
			Unit:      "mm",
			Precision: 3,
			Sort:      0,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "厚度",
					Key:       "thickness",
					DataIndex: 0,
				},
			},
		},
		{
			Key:    "corrosion_rate",
			Name:   "腐蚀率",
			Unit:   "mm/a",
			Sort:   1,
			IsShow: true,
			Fields: []Field{
				{
					Name:      "短周期腐蚀率",
					Key:       "short_corrosion_rate",
					DataIndex: 5,
				},
				{
					Name:      "长周期腐蚀率",
					Key:       "long_corrosion_rate",
					DataIndex: 6,
				},
			},
		},
		{
			Key:       "temperature",
			Name:      "温度",
			Unit:      "°C",
			Precision: 3,
			Sort:      2,
			IsShow:    true,
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
			Key:       "tof",
			Name:      "飞行时间",
			Unit:      "ns",
			Precision: 3,
			Sort:      4,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "飞行时间",
					Key:       "tof",
					DataIndex: 2,
				},
			},
		},
		{
			Key:       "signal_strength",
			Name:      "信号强度",
			Unit:      "",
			Precision: 3,
			Sort:      5,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号强度",
					Key:       "signal_strength",
					DataIndex: 4,
				},
			},
		},
		{
			Key:       "signal_quality",
			Name:      "信号质量",
			Unit:      "",
			Precision: 3,
			Sort:      6,
			IsShow:    true,
			Fields: []Field{
				{
					Name:      "信号质量",
					Key:       "signal_quality",
					DataIndex: 7,
				},
			},
		},
	}

	properties[VibrationRmsFFTXYZTemperatureSensor] = Properties{
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
			Name:      "一倍频振幅",
			Unit:      "m/s²",
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
			Name:      "二倍频振幅",
			Unit:      "m/s²",
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
			Name:      "三倍频振幅",
			Unit:      "m/s²",
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
			Name:      "半倍频振幅",
			Unit:      "m/s²",
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
			Key:       "acc_var",
			Name:      "方差",
			Unit:      "",
			Precision: 3,
			Sort:      17,
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
			IsShow:    true,
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
			IsShow:    true,
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
	}
	properties[TempMAX31865] = Properties{
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
	}
}
