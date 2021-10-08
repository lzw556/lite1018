package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"gorm.io/gorm"
	"reflect"
)

func InitTables(db *gorm.DB) {
	tables := []interface{}{
		&po.User{},
		&po.Role{},
		&po.Asset{},
		&po.Device{},
		&po.Property{},
		&po.Network{},
		&po.Firmware{},
	}
	for _, table := range tables {
		if !db.Migrator().HasTable(table) {
			if err := db.Migrator().CreateTable(table); err != nil {
				panic(err)
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
							panic(err)
						}
					}
				}
			}
		}
	}
	initUser(db)
	initProperties(db)
}

func initUser(db *gorm.DB) {
	user := po.User{
		Username: "admin",
		Password: "123456",
	}
	err := db.FirstOrCreate(&user, map[string]interface{}{"id": 1, "username": user.Username}).Error
	if err != nil {
		panic(err)
	}
}

func initProperties(db *gorm.DB) {
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
	}
	for _, property := range properties {
		err := db.FirstOrCreate(&property, map[string]interface{}{"name": property.Name, "device_type_id": property.DeviceTypeID, "sensor_type": property.SensorType}).Error
		if err != nil {
			panic(err)
		}
	}
}
