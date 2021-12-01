package specification

import "gorm.io/gorm"

type DeviceTypeEqSpec uint

func (DeviceTypeEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceTypeEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if uint(s) == 0 {
			return db
		}
		return db.Where("device_type_id = ?", s)
	}
}
