package specification

import (
	"gorm.io/gorm"
)

type CategorySpec uint

func (s CategorySpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s CategorySpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("category = ?", s)
	}
}
