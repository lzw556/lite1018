package specification

import (
	"gorm.io/gorm"
)

type IsActiveSpec bool

func (s IsActiveSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s IsActiveSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("is_active = ?", s)
	}
}
