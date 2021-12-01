package specification

import (
	"gorm.io/gorm"
)

type LevelInSpec []uint

func (s LevelInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s LevelInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("level IN ?", s)
		}
		return db
	}
}
