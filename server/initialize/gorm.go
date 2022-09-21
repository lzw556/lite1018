package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
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
		&entity.DeviceLinkStatus{},
	}

	// db.Migrator().DropTable(&entity.Menu{}, &entity.RoleMenuRelation{})
	if err := db.AutoMigrate(tables...); err != nil {
		return err
	}
	if err := initUsers(db); err != nil {
		return err
	}
	if err := initMenus(db); err != nil {
		return err
	}
	if err := initRoles(db); err != nil {
		return err
	}
	if err := initRoleMenuRelations(db); err != nil {
		return err
	}
	if err := initProject(db); err != nil {
		return err
	}
	return nil
}
