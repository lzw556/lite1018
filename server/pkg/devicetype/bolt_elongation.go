package devicetype

type BoltElongation struct {
	SamplePeriod     Setting `json:"sample_period"`
	SampleOffset     Setting `json:"sample_offset"`
	SensorFlags      Setting `json:"sensor_flags"`
	SpeedObject      Setting `json:"speed_object"`
	ScanMode         Setting `json:"scan_mode"`
	ObjTempK1        Setting `json:"obj_temp_k1"`
	ObjTempK2        Setting `json:"obj_temp_k2"`
	RodTempK1        Setting `json:"rod_temp_k1"`
	RodTempK2        Setting `json:"rod_temp_k2"`
	InitialPreload   Setting `json:"initial_preload"`
	InitialLength    Setting `json:"initial_length"`
	PreloadCoef      Setting `json:"preload_coef"`
	PreloadIsEnabled Setting `json:"preload_is_enabled"`
	ElasticModulus   Setting `json:"elastic_modulus"`
	SectionalArea    Setting `json:"sectional_area"`
	ClampedLength    Setting `json:"clamped_length"`
	Odr              Setting `json:"odr"`
	Samples          Setting `json:"samples"`
}

func (BoltElongation) ID() uint {
	return BoltElongationType
}

func (BoltElongation) SensorID() uint {
	return LengthAttitudeAccelerationSensor
}

func (d BoltElongation) Settings() Settings {
	d.SamplePeriod = samplePeriodSetting()
	d.SampleOffset = sampleOffsetSetting()
	d.SensorFlags = Setting{
		Name:  "采样模式",
		Key:   "sensor_flags",
		Type:  Uint64ValueType,
		Value: 1,
		Options: map[int]string{
			1: "静态模式",
			2: "动态模式",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     2,
	}
	d.SpeedObject = Setting{
		Name:     "波速",
		Key:      "speed_object",
		Type:     FloatValueType,
		Value:    5920,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     3,
	}
	d.ScanMode = Setting{
		Name:  "超声波扫描模式",
		Key:   "scan_mode",
		Type:  Uint8ValueType,
		Value: 0, Options: map[int]string{
			0: "非大孔螺栓",
			3: "大孔螺栓",
		},
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     4,
	}
	d.ObjTempK1 = temperatureKSetting("温度补偿系数1", "obj_temp_k1", 0, 5, SettingGroupPreload)
	d.ObjTempK2 = temperatureKSetting("温度补偿系数2", "obj_temp_k2", 0.0155, 6, SettingGroupPreload)
	d.RodTempK1 = temperatureKSetting("温度补偿系数3", "odr_temp_k1", 0, 7, SettingGroupPreload)
	d.RodTempK2 = temperatureKSetting("温度补偿系数4", "odr_temp_k2", 0.1196, 8, SettingGroupPreload)
	d.PreloadIsEnabled = Setting{
		Name:     "预紧力",
		Key:      "preload_is_enabled",
		Type:     BoolValueType,
		Value:    true, // true - enabled, false - disabled
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     9,
	}
	d.InitialPreload = Setting{
		Name:     "初始预紧力",
		Key:      "initial_preload",
		Type:     FloatValueType,
		Value:    0.0,
		Unit:     "kN",
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     10,
	}
	d.InitialLength = Setting{
		Name:     "初始预紧长度",
		Key:      "initial_length",
		Type:     FloatValueType,
		Value:    0.0,
		Unit:     "mm",
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     11,
	}
	d.PreloadCoef = Setting{
		Name:     "预紧系数",
		Key:      "preload_coef",
		Type:     FloatValueType,
		Value:    1.0,
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     12,
	}
	d.ElasticModulus = Setting{
		Name:     "弹性模量",
		Key:      "elastic_modulus",
		Type:     FloatValueType,
		Value:    210.0,
		Unit:     "GPa",
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     13,
	}
	d.SectionalArea = Setting{
		Name:     "截面积",
		Key:      "sectional_area",
		Type:     FloatValueType,
		Value:    1305.462,
		Unit:     "mm^2",
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     14,
	}
	d.ClampedLength = Setting{
		Name:     "有效受力长度",
		Key:      "clamped_length",
		Type:     FloatValueType,
		Value:    215.0,
		Unit:     "mm",
		Parent:   d.PreloadIsEnabled.Key,
		Show:     true,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     15,
	}
	d.Odr = Setting{
		Name:  "动态模式采样频率",
		Key:   "odr",
		Type:  Uint16ValueType,
		Value: 1,
		Options: map[int]string{
			0: "10Hz",
			1: "20Hz",
			2: "40Hz",
			3: "80Hz",
		},
		Parent:   d.SensorFlags.Key,
		Show:     2,
		Category: SensorsSettingCategory,
		Group:    SettingGroupPreload,
		Sort:     16,
	}
	d.Samples = Setting{
		Name:  "动态模式采样时间",
		Key:   "samples",
		Type:  Uint32ValueType,
		Value: 16000,
		Options: map[int]string{
			1000:  "1秒",
			2000:  "2秒",
			4000:  "4秒",
			8000:  "8秒",
			16000: "16秒",
		},
		Parent:   d.SensorFlags.Key,
		Show:     2,
		Category: SensorsSettingCategory,
		Group:    SettingGroupGeneral,
		Sort:     17,
	}
	return []Setting{
		d.SensorFlags,
		d.SpeedObject,
		d.ScanMode,
		d.ObjTempK1,
		d.ObjTempK2,
		d.RodTempK1,
		d.RodTempK2,
		d.InitialPreload,
		d.InitialLength,
		d.PreloadCoef,
		d.PreloadIsEnabled,
		d.ElasticModulus,
		d.SectionalArea,
		d.ClampedLength,
		d.Odr,
		d.Samples,
	}
}

func (BoltElongation) Properties(sensorID uint) Properties {
	return properties[int(sensorID)]
}
