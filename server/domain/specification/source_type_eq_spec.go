package specification

import (
	"gorm.io/gorm"
)

type SourceTypeEqSpec string

func (s SourceTypeEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s SourceTypeEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("source_type = ?", string(s))
	}
}
