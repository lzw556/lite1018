package specification

import (
	"gorm.io/gorm"
)

type PropertyEqSpec uint

func (s PropertyEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s PropertyEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("property_id = ?", s)
	}
}
