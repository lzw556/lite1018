package specification

import (
	"gorm.io/gorm"
)

type SourceEqSpec uint

func (s SourceEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s SourceEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("source_id = ?", s)
	}
}
