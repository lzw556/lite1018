package devicetype

type AngleDip struct{}

func (AngleDip) ID() uint {
	return AngleDipType
}

func (AngleDip) SensorID() uint {
	return SCL3300Sensor
}

func (AngleDip) Settings() Settings {
	return []Setting{
		{
			Name:     "采集周期",
			Key:      "sample_period",
			Type:     Uint32ValueType,
			Value:    1200000, // 20 minutes
			Category: SensorsSettingCategory,
			Options:  samplePeriodOption1,
			Sort:     0,
		},
		{
			Name:     "被测物半径",
			Key:      "object_radius",
			Type:     FloatValueType,
			Category: SensorsSettingCategory,
			Value:    0,
			Group:    SettingGroupGeneral,
			Sort:     1,
		},
		{
			Name:     "被测物高度",
			Key:      "object_length",
			Type:     FloatValueType,
			Category: SensorsSettingCategory,
			Value:    0,
			Group:    SettingGroupGeneral,
			Sort:     2,
		},
		{
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
			Sort:  3,
		},
		{
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
			Parent: "sensor_flags",
			Show:   2,
			Group:  SettingGroupGeneral,
			Sort:   4,
		},
		{
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
			Parent: "sensor_flags",
			Show:   2,
			Group:  SettingGroupGeneral,
			Sort:   5,
		},
	}
}

func (d AngleDip) Properties(sensorID uint) Properties {
	switch sensorID {
	case SCL3300Sensor:
		return Properties{
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
				Unit:      "",
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
	}
	return nil
}
