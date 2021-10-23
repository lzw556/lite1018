package specification

import (
	"gorm.io/gorm"
)

type DeviceMacsSpec []string

func (s DeviceMacsSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s DeviceMacsSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("mac_address IN ?", s)
		}
		return db
	}
}
