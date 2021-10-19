package specification

import "gorm.io/gorm"

type DeviceTypeSpec uint

func (DeviceTypeSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceTypeSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if uint(s) == 0 {
			return db
		}
		return db.Where("device_type_id = ?", s)
	}
}
