package specification

import (
	"gorm.io/gorm"
)

type ProductIDEqSpec uint

func (s ProductIDEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ProductIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("product_id = ?", s)
	}
}
