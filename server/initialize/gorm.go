package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"gorm.io/gorm"
	"reflect"
)

func InitTables(db *gorm.DB) error {
	tables := []interface{}{
		&po.User{},
		&po.Project{},
		&po.Role{},
		&po.Menu{},
		&po.RoleMenuRelation{},
		&po.UserProjectRelation{},
		&po.Permission{},
		&po.Asset{},
		&po.Device{},
		&po.Network{},
		&po.Firmware{},
		&po.Alarm{},
		&po.AlarmTemplate{},
		&po.AlarmRecord{},
		&po.AlarmRecordAcknowledge{},
		&po.Measurement{},
		&po.MeasurementDeviceBinding{},
	}
	db.Migrator().DropTable(&po.Menu{}, &po.Permission{})
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
