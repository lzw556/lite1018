package specification

import (
	"gorm.io/gorm"
)

type DeviceMacEqSpec string

func (s DeviceMacEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceMacEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("mac_address = ?", s)
		}
		return db
	}
}
