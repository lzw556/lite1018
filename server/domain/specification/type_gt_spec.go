package specification

import "gorm.io/gorm"

type TypeGtSpec uint

func (TypeGtSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s TypeGtSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if uint(s) == 0 {
			return db
		}
		return db.Where("type > ?", s)
	}
}
