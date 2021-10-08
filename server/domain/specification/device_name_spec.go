package specification

import "gorm.io/gorm"

type DeviceNameSpec string

func (s DeviceNameSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceNameSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("name = ?", s)
		}
		return db
	}
}
