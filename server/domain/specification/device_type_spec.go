package specification

import "gorm.io/gorm"

type DeviceTypeSpec uint

func (DeviceTypeSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceTypeSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("type_id = ?", s)
	}
}
