package specification

import (
	"gorm.io/gorm"
)

type DeviceMacSpec string

func (s DeviceMacSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceMacSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("mac_address = ?", s)
		}
		return db
	}
}
