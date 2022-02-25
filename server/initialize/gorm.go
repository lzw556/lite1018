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
		&entity.AlarmTemplate{},
		&entity.AlarmRecord{},
		&entity.AlarmRecordAcknowledge{},
	}
	db.Migrator().DropTable(&entity.Menu{}, &entity.Permission{})
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
