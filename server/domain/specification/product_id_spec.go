package specification

import (
	"gorm.io/gorm"
)

type ProductIDSpec uint

func (s ProductIDSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s ProductIDSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("product_id = ?", s)
	}
}
