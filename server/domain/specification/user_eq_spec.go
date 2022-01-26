package specification

import (
	"gorm.io/gorm"
)

type UserEqSpec uint

func (s UserEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s UserEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", s)
	}
}
