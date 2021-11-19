package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"gorm.io/gorm"
	"reflect"
)

func InitTables(db *gorm.DB) error {
	tables := []interface{}{
		&po.User{},
		&po.Role{},
		&po.Asset{},
		&po.Device{},
		&po.Property{},
		&po.Network{},
		&po.Firmware{},
		&po.AlarmRule{},
		&po.AlarmRuleTemplate{},
		&po.AlarmRecord{},
		&po.AlarmRecordAcknowledge{},
	}
	for _, table := range tables {
		if !db.Migrator().HasTable(table) {
			if err := db.Migrator().CreateTable(table); err != nil {
				return err
			}
		} else {
			t := reflect.TypeOf(table)
			if t.Kind() == reflect.Ptr {
				t = t.Elem()
			}
			if t.Kind() == reflect.Struct {
				for i := 0; i < t.NumField(); i++ {
					name := t.Field(i).Name
					if !db.Migrator().HasColumn(table, name) && name != "Model" && t.Field(i).Tag.Get("gorm") != "-" {
						if err := db.Migrator().AddColumn(table, name); err != nil {
							return err
						}
					}
				}
			}
		}
	}
	if err := initUser(db); err != nil {
		return err
	}
	if err := initProperties(db); err != nil {
		return err
	}
	return nil
}

func initUser(db *gorm.DB) error {
	user := po.User{
		Username: "admin",
		Password: "123456",
	}
	err := db.FirstOrCreate(&user, map[string]interface{}{"id": 1, "username": user.Username}).Error
	if err != nil {
		return err
	}
	return err
}

func initProperties(db *gorm.DB) error {
	properties := []po.Property{
		{
			Name:         "松动角度",
			DeviceTypeID: devicetype.BoltLooseningType,
			SensorType:   devicetype.BoltAngleSensor,
			Unit:         "°",
			Precision:    3,
			Fields: po.Fields{
				"loosening_angle": 1,
			},
		},
		{
			Name:         "姿态指数",
			DeviceTypeID: devicetype.BoltLooseningType,
			SensorType:   devicetype.BoltAngleSensor,
			Unit:         "",
			Precision:    3,
			Fields: po.Fields{
				"attitude": 5,
			},
		},
		{
			Name:         "移动指数",
			DeviceTypeID: devicetype.BoltLooseningType,
			SensorType:   devicetype.BoltAngleSensor,
			Unit:         "",
			Precision:    3,
			Fields: po.Fields{
				"motion": 8,
			},
		},
		{
			Name:         "预紧力",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "kN",
			Precision:    3,
			Fields: po.Fields{
				"preload": 5,
			},
		},
		{
			Name:         "缺陷位置",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "mm",
			Precision:    3,
			Fields: po.Fields{
				"defection": 6,
			},
		},
		{
			Name:         "长度",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "mm",
			Precision:    3,
			Fields: po.Fields{
				"length": 0,
			},
		},
		{
			Name:         "温度",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "°C",
			Precision:    3,
			Fields: po.Fields{
				"temperature": 1,
			},
		},
		{
			Name:         "飞行时间",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "ns",
			Precision:    3,
			Fields: po.Fields{
				"tof": 2,
			},
		},
		{
			Name:         "加速度",
			DeviceTypeID: devicetype.BoltElongationType,
			SensorType:   devicetype.LengthAttitudeAccelerationSensor,
			Unit:         "m/s²",
			Precision:    3,
			Fields: po.Fields{
				"acceleration_x": 7,
				"acceleration_y": 8,
				"acceleration_z": 9,
			},
		},
		{
			Name:         "厚度",
			DeviceTypeID: devicetype.NormalTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "mm",
			Precision:    3,
			Fields: po.Fields{
				"thickness": 0,
			},
		},
		{
			Name:         "温度",
			DeviceTypeID: devicetype.NormalTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "°C",
			Precision:    3,
			Fields: po.Fields{
				"temperature": 1,
			},
		},
		{
			Name:         "飞行时间",
			DeviceTypeID: devicetype.NormalTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "ns",
			Precision:    3,
			Fields: po.Fields{
				"tof": 2,
			},
		},
		{
			Name:         "厚度",
			DeviceTypeID: devicetype.HighTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "mm",
			Precision:    3,
			Fields: po.Fields{
				"thickness": 0,
			},
		},
		{
			Name:         "温度",
			DeviceTypeID: devicetype.HighTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "°C",
			Precision:    3,
			Fields: po.Fields{
				"temperature": 1,
			},
		},
		{
			Name:         "飞行时间",
			DeviceTypeID: devicetype.HighTemperatureCorrosionType,
			SensorType:   devicetype.ThicknessSensor,
			Unit:         "ns",
			Precision:    3,
			Fields: po.Fields{
				"tof": 2,
			},
		},
		{
			Name:         "角度",
			DeviceTypeID: devicetype.AngleDipType,
			SensorType:   devicetype.SCL3300Sensor,
			Unit:         "°",
			Precision:    3,
			Fields: po.Fields{
				"inclination": 0,
				"pitch":       1,
				"roll":        2,
			},
		},
		{
			Name:         "速度",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "mm/s",
			Precision:    3,
			Fields: po.Fields{
				"velocity_x": 1,
				"velocity_y": 6,
				"velocity_z": 11,
			},
		},
		{
			Name:         "加速度",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "m/s²",
			Precision:    3,
			Fields: po.Fields{
				"acceleration_x": 0,
				"acceleration_y": 5,
				"acceleration_z": 10,
			},
		},
		{
			Name:         "位移",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "mm",
			Precision:    3,
			Fields: po.Fields{
				"displacement_x": 2,
				"displacement_y": 7,
				"displacement_z": 12,
			},
		},
		{
			Name:         "真峰峰值",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "gE",
			Precision:    3,
			Fields: po.Fields{
				"enveloping_x": 3,
				"enveloping_y": 8,
				"enveloping_z": 13,
			},
		},
		{
			Name:         "波峰因数",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "",
			Precision:    3,
			Fields: po.Fields{
				"crest_factor_x": 4,
				"crest_factor_y": 9,
				"crest_factor_z": 14,
			},
		},
		{
			Name:         "温度",
			DeviceTypeID: devicetype.VibrationTemperature3AxisType,
			SensorType:   devicetype.VibrationRmsFFTXYZTemperatureSensor,
			Unit:         "°C",
			Precision:    3,
			Fields: po.Fields{
				"temperature": 39,
			},
		},
	}
	for _, property := range properties {
		err := db.FirstOrCreate(&property, map[string]interface{}{"name": property.Name, "device_type_id": property.DeviceTypeID, "sensor_type": property.SensorType}).Error
		if err != nil {
			return err
		}
	}
	return nil
}
