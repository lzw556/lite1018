package specification

import (
	"gorm.io/gorm"
)

type TypeEqSpec uint

func (s TypeEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s TypeEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("type = ?", s)
	}
}
