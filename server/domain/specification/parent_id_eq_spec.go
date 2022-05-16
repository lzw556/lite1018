package specification

import (
	"gorm.io/gorm"
)

type ParentEqSpec string

func (s ParentEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ParentEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("parent = ?", s)
	}
}
