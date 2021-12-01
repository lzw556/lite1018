package specification

import (
	"gorm.io/gorm"
)

type DeviceInSpec []uint

func (s DeviceInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("device_id IN ?", s)
	}
}
