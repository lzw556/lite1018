package specification

import (
	"gorm.io/gorm"
)

type NameEqSpec string

func (s NameEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s NameEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("name = ?", s)
	}
}
