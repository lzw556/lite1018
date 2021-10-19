package specification

import (
	"gorm.io/gorm"
)

type TypeSpec uint

func (s TypeSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s TypeSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("type_id = ?", s)
	}
}
