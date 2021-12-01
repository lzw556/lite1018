package specification

import (
	"gorm.io/gorm"
)

type CategoryEqSpec uint

func (s CategoryEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s CategoryEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("category = ?", s)
	}
}
