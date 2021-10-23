package specification

import (
	"gorm.io/gorm"
)

type PropertySpec uint

func (s PropertySpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s PropertySpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("property_id = ?", s)
	}
}
