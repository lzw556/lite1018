package specification

import (
	"gorm.io/gorm"
)

type EnabledEqSpec bool

func (s EnabledEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s EnabledEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("enabled = ?", s)
	}
}
