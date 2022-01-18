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
		},
	}
}
