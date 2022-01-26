package specification

import "gorm.io/gorm"

type ModeEqSpec uint

func (s ModeEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ModeEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("mode = ?", s)
	}
}
