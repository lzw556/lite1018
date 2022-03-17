package specification

import (
	"gorm.io/gorm"
)

type TypeInSpec []uint

func (s TypeInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s TypeInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("type IN (?)", s)
		}
		return db.Where("type IN (0)")
	}
}
