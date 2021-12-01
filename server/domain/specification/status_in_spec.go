package specification

import (
	"gorm.io/gorm"
)

type StatusInSpec []uint

func (s StatusInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s StatusInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("status IN ?", s)
	}
}
