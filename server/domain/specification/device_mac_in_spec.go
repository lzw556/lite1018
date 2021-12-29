package specification

import (
	"gorm.io/gorm"
)

type DeviceMacInSpec []string

func (s DeviceMacInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceMacInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("mac_address IN ?", s)
	}
}
