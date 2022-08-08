package devicetype

import "github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype/validator"

type VibrationTemperature3AxisNB struct {
	CommunicationPeriod Setting `json:"communication_period"`
	CommunicationOffset Setting `json:"communication_offset"`
	NtpIsEnabled        Setting `json:"ntp_is_enabled"`
	NtpAddr             Setting `json:"ntp_addr"`
	SamplePeriod        Setting `json:"sample_period"`
	SampleOffset        Setting `json:"sample_offset"`
	SamplePeriod2       Setting `json:"sample_period_2"`
	SampleOffset2       Setting `json:"sample_offset_2"`
	IsEnabled2          Setting `json:"is_enabled_2"`
	Acc3IsAuto          Setting `json:"acc3_is_auto"`
	Acc3Range           Setting `json:"acc3_range"`
	Acc3Samples         Setting `json:"acc3_samples"`
	Acc3Odr             Setting `json:"acc3_odr"`
	Acc3Range2          Setting `json:"acc3_range_2"`
	Acc3Odr2            Setting `json:"acc3_odr_2"`
	Acc3Samples2        Setting `json:"acc3_samples_2"`
	BaseFrequency       Setting `json:"base_frequency"`
	VibrationKX         Setting `json:"vibration_k_x"`
	VibrationKY         Setting `json:"vibration_k_y"`
	VibrationKZ         Setting `json:"vibration_k_z"`
}

func (VibrationTemperature3AxisNB) ID() uint {
	return VibrationTemperature3AxisNBType
}

func (d VibrationTemperature3AxisNB) SensorID() uint {
	return VibrationRmsFFTXYZTemperatureSensor
}

func (d VibrationTemperature3AxisNB) Settings() Settings {
	d.CommunicationPeriod = communicationPeriodSetting(0)
	d.CommunicationOffset = communicationOffsetSetting(1)
	d.NtpIsEnabled = Setting{
		Name:     "是否启用NTP",
		Key:      "ntp_is_enabled",
		Type:     BoolValueType,
		Value:    true, // 0: Disable 1: Enable
		Category: IpnSettingCategory,
		Sort:     2,
		Group:    SettingGroupNetwork,
	}
	d.NtpAddr = Setting{
		Name:     "NTP服务器地址",
		Key:      "ntp_addr",
		Type:     StringValueType,
		Value:    "ntp1.aliyun.com",
		Category: IpnSettingCategory,
		Sort:     3,
		Parent:   d.NtpIsEnabled.Key,
		Show:     true,
		Group:    SettingGroupNetwork,
	}
	d.SamplePeriod = samplePeriodSetting(4)
	d.SampleOffset = sampleOffsetSetting(5)
	d.IsEnabled2 = Setting{
		Name:     "原始数据采集",
		Key:      "is_enabled_2",
		Type:     BoolValueType,
		Value:    false,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     6,
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
		Sort:     7,
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
		Sort:     8,
	}
	d.Acc3IsAuto = Setting{
		Name:     "自动增益",
		Key:      "acc3_is_auto",
		Type:     BoolValueType,
		Value:    true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     9,
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
		Sort:     10,
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
		Sort:     11,
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
		Sort:     12,
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
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     13,
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
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     14,
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
		Category: SensorsSettingCategory,
		Group:    SettingGroupAcceleration,
		Sort:     15,
	}
	d.BaseFrequency = Setting{
		Name:     "FFT运算基础频率",
		Key:      "base_frequency",
		Type:     FloatValueType,
		Value:    0,
		Unit:     "Hz",
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     16,
	}
	d.VibrationKX = Setting{
		Name:     "X轴加速度系数",
		Key:      "vibration_k_x",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     17,
	}
	d.VibrationKY = Setting{
		Name:     "Y轴加速度系数",
		Key:      "vibration_k_y",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     18,
	}
	d.VibrationKZ = Setting{
		Name:     "Z轴加速度系数",
		Key:      "vibration_k_z",
		Type:     FloatValueType,
		Value:    1,
		Category: SensorsSettingCategory,
		Group:    SettingGroupOther,
		Sort:     19,
	}
	return []Setting{
		d.CommunicationPeriod,
		d.CommunicationOffset,
		d.NtpIsEnabled,
		d.NtpAddr,
		d.SamplePeriod,
		d.SampleOffset,
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

func (d VibrationTemperature3AxisNB) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
