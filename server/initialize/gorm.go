package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
	"reflect"
)

func InitTables(db *gorm.DB) error {
	tables := []interface{}{
		&entity.User{},
		&entity.Project{},
		&entity.Role{},
		&entity.Menu{},
		&entity.RoleMenuRelation{},
		&entity.UserProjectRelation{},
		&entity.Permission{},
		&entity.Device{},
		&entity.Network{},
		&entity.Firmware{},
		&entity.AlarmRule{},
		&entity.AlarmSource{},
		&entity.AlarmRecord{},
		&entity.AlarmRecordAcknowledge{},
		&entity.Event{},
	}

	//db.Migrator().DropTable("casbin_rule")
	//var devices []entity.Device
	//if db.Find(&devices).Error == nil {
	//	for _, device := range devices {
	//		if t := devicetype.Get(device.Type); t != nil {
	//			device.Settings = make([]entity.DeviceSetting, len(t.Settings()))
	//			for i, setting := range t.Settings() {
	//				device.Settings[i] = entity.DeviceSetting{
	//					Key:      setting.Key,
	//					Value:    setting.Value,
	//					Category: string(setting.Category),
	//				}
	//			}
	//			db.Save(&device)
	//		}
	//	}
	//}
	//var result []map[string]interface{}
	//db.Table("ts_alarm_rule").Unscoped().Find(&result)
	//for _, r := range result {
	//	fmt.Println(r["id"])
	//	v := cast.ToString(r["source_type"])
	//	typeID := strings.Split(v, "::")[1]
	//	db.Table("ts_alarm_rule").Unscoped().Where("id = ?", r["id"]).UpdateColumns(map[string]interface{}{
	//		"source_type": typeID,
	//		"category":    1,
	//	})
	//}
	//
	//db.Migrator().DropTable(&entity.Menu{}, &entity.Permission{}, &entity.AlarmRule{}, &entity.AlarmSource{})
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
	if err := initUsers(db); err != nil {
		return err
	}
	if err := initMenus(db); err != nil {
		return err
	}
	if err := initPermissions(db); err != nil {
		return err
	}
	if err := initProject(db); err != nil {
		return err
	}
	return nil
}
