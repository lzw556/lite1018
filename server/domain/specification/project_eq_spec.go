package specification

import (
	"gorm.io/gorm"
)

type ProjectEqSpec uint

func (s ProjectEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ProjectEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("project_id = ?", s)
	}
}
