package specification

import (
	"gorm.io/gorm"
)

type SourceInSpec []uint

func (s SourceInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s SourceInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("source_id IN (?)", s)
		}
		return db.Where("source_id IN (0)")
	}
}
