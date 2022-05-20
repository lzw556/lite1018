package specification

import (
	"gorm.io/gorm"
)

type ParentIdEqSpec uint

func (s ParentIdEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ParentIdEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("parent_id = ?", s)
	}
}
