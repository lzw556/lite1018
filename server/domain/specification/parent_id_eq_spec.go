package specification

import (
	"gorm.io/gorm"
)

type ParentIDEqSpec uint

func (s ParentIDEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ParentIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("parent_id = ?", s)
	}
}
