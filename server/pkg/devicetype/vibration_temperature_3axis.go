package devicetype

import "github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype/validator"

type VibrationTemperature3Axis struct {
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
	BaseFrequency Setting `json:"base_frequency"`
	VibrationKX   Setting `json:"vibration_k_x"`
	VibrationKY   Setting `json:"vibration_k_y"`
	VibrationKZ   Setting `json:"vibration_k_z"`
}

func (VibrationTemperature3Axis) ID() uint {
	return VibrationTemperature3AxisType
}

func (VibrationTemperature3Axis) SensorID() uint {
	return VibrationRmsFFTXYZTemperatureSensor
}

func (d VibrationTemperature3Axis) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting(0)
	d.SampleOffset = sampleOffsetSetting(1)
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
		Options:  samplePeriod2Options,
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
		Options:  sampleOffset2Options,
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     5,
	}
	d.Acc3IsAuto = Setting{
		Name:     "自动增益",
		Key:      "acc3_is_auto",
		Type:     BoolValueType,
		Value:    true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     6,
	}
	d.Acc3Range = Setting{
		Name:  "量程",
		Key:   "acc3_range",
		Type:  Uint8ValueType,
		Value: 0,
		Options: map[int]string{
			0: "8g",
			1: "16g",
			2: "32g",
		},
		Parent:   d.Acc3IsAuto.Key,
		Show:     false,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     7,
	}
	d.Acc3Odr = Setting{
		Name:  "采样频率",
		Key:   "acc3_odr",
		Type:  Uint8ValueType,
		Value: 12,
		Options: map[int]string{
			5:  "0.4kHz",
			6:  "0.8kHz",
			7:  "1.6kHz",
			12: "3.2kHz",
			13: "6.4kHz",
			14: "12.8kHz",
			15: "25.6kHz",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     8,
	}
	d.Acc3Samples = Setting{
		Name:  "采样点数",
		Key:   "acc3_samples",
		Type:  Uint32ValueType,
		Value: 1024,
		Options: map[int]string{
			1024: "1024",
			2048: "2048",
			4096: "4096",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     9,
	}
	d.Acc3Range2 = Setting{
		Name:  "原始数据量程",
		Key:   "acc3_range_2",
		Type:  Uint8ValueType,
		Value: 2,
		Options: map[int]string{
			0: "8g",
			1: "16g",
			2: "32g",
		},
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     10,
	}
	d.Acc3Odr2 = Setting{
		Name:  "原始数据采样频率",
		Key:   "acc3_odr_2",
		Type:  Uint8ValueType,
		Value: 12,
		Options: map[int]string{
			5:  "0.4kHz",
			6:  "0.8kHz",
			7:  "1.6kHz",
			12: "3.2kHz",
			13: "6.4kHz",
			14: "12.8kHz",
			15: "25.6kHz",
		},
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     11,
	}
	d.Acc3Samples2 = Setting{
		Name:  "原始数据采样时间",
		Key:   "acc3_samples_2",
		Type:  Uint32ValueType,
		Value: 10000,
		Unit:  "毫秒",
		Validator: validator.Range{
			Min: 100,
			Max: 20 * 1000,
		},
		Parent:   d.IsEnabled2.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     12,
	}
	d.BaseFrequency = Setting{
		Name:     "FFT运算基础频率",
		Key:      "base_frequency",
		Type:     FloatValueType,
		Value:    0,
		Unit:     "Hz",
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     13,
	}
	d.VibrationKX = Setting{
		Name:     "X轴加速度系数",
		Key:      "vibration_k_x",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     18,
	}
	d.VibrationKY = Setting{
		Name:     "Y轴加速度系数",
		Key:      "vibration_k_y",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     19,
	}
	d.VibrationKZ = Setting{
		Name:     "Z轴加速度系数",
		Key:      "vibration_k_z",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     20,
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
		d.BaseFrequency,
		d.VibrationKX,
		d.VibrationKY,
		d.VibrationKZ,
	}
}

func (VibrationTemperature3Axis) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
