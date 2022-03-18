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
		if len(s) > 0 {
			return db.Where("status IN (?)", s)
		}
		return db.Where("status IN (-1)")
	}
}
