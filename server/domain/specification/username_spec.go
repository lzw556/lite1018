package specification

import "gorm.io/gorm"

type UsernameSpec string

func (UsernameSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s UsernameSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("username = ?", s)
	}
}
