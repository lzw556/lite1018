package devicetype

type AngleDipNB struct {
	CommunicationPeriod Setting `json:"communication_period"`
	CommunicationOffset Setting `json:"communication_offset"`
	NtpIsEnabled        Setting `json:"ntp_is_enabled"`
	NtpAddr             Setting `json:"ntp_addr"`
	SamplePeriod        Setting `json:"sample_period"`
	SampleOffset        Setting `json:"sample_offset"`
	ObjectRadius        Setting `json:"object_radius"`
	ObjectLength        Setting `json:"object_length"`
	SensorFlags         Setting `json:"sensor_flags"`
	Acc3Odr2            Setting `json:"acc3_odr_2"`
	Acc3Samples2        Setting `json:"acc3_samples_2"`
}

func (AngleDipNB) ID() uint {
	return AngleDipNBType
}

func (AngleDipNB) SensorID() uint {
	return SCL3300Sensor
}

func (d AngleDipNB) Settings() Settings {
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
	d.SensorFlags = Setting{
		Name:     "采样模式",
		Key:      "sensor_flags",
		Type:     Uint32ValueType,
		Category: SensorsSettingCategory,
		Value:    1,
		Options: map[int]string{
			1: "静态模式",
			2: "动态模式",
		},
		Group: SettingGroupGeneral,
		Sort:  6,
	}
	d.ObjectRadius = Setting{
		Name:     "被测物半径",
		Key:      "object_radius",
		Type:     FloatValueType,
		Category: SensorsSettingCategory,
		Value:    0,
		Group:    SettingGroupInclinometer,
		Sort:     7,
	}
	d.ObjectLength = Setting{
		Name:     "被测物高度",
		Key:      "object_length",
		Type:     FloatValueType,
		Category: SensorsSettingCategory,
		Value:    0,
		Group:    SettingGroupInclinometer,
		Sort:     8,
	}
	d.Acc3Odr2 = Setting{
		Name:     "动态模式采样频率",
		Key:      "acc3_odr_2",
		Type:     Uint8ValueType,
		Category: SensorsSettingCategory,
		Value:    0,
		Options: map[int]string{
			0: "1Hz",
			1: "5Hz",
			2: "10Hz",
			3: "20Hz",
			4: "50Hz",
			5: "100Hz",
			6: "200Hz",
			7: "500Hz",
		},
		Parent: d.SensorFlags.Key,
		Show:   2,
		Group:  SettingGroupAcceleration,
		Sort:   9,
	}
	d.Acc3Samples2 = Setting{
		Name:     "动态模式采样时间",
		Key:      "acc3_samples_2",
		Type:     Uint32ValueType,
		Category: SensorsSettingCategory,
		Value:    1000,
		Options: map[int]string{
			1000: "1秒",
			2000: "2秒",
			3000: "3秒",
			4000: "4秒",
			5000: "5秒",
		},
		Parent: d.SensorFlags.Key,
		Show:   2,
		Group:  SettingGroupAcceleration,
		Sort:   10,
	}
	return Settings{
		d.CommunicationPeriod,
		d.CommunicationOffset,
		d.NtpIsEnabled,
		d.NtpAddr,
		d.SamplePeriod,
		d.SampleOffset,
		d.SensorFlags,
		d.ObjectRadius,
		d.ObjectLength,
		d.Acc3Odr2,
		d.Acc3Samples2,
	}
}

func (d AngleDipNB) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
