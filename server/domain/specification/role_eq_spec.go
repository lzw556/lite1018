package specification

import (
	"gorm.io/gorm"
)

type RoleEqSpec uint

func (s RoleEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s RoleEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("role_id = ?", s)
	}
}
