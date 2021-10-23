package specification

import (
	"gorm.io/gorm"
)

type LevelsSpec []uint

func (s LevelsSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s LevelsSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("level IN ?", s)
		}
		return db
	}
}
