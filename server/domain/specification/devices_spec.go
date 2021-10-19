package specification

import (
	"gorm.io/gorm"
)

type DevicesSpec []uint

func (s DevicesSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DevicesSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("device_id IN ?", s)
		}
		return db
	}
}
