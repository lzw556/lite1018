package specification

import (
	"gorm.io/gorm"
)

type IsActive bool

func (s IsActive) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s IsActive) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("is_active = ?", s)
	}
}
