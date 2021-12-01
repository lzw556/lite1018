package specification

import "gorm.io/gorm"

type UsernameEqSpec string

func (UsernameEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s UsernameEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("username = ?", s)
	}
}
