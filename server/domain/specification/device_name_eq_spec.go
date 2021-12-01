package specification

import "gorm.io/gorm"

type DeviceNameEqSpec string

func (s DeviceNameEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceNameEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("name = ?", s)
		}
		return db
	}
}
