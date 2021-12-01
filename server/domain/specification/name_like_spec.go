package specification

import (
	"fmt"
	"gorm.io/gorm"
)

type NameLikeSpec string

func (s NameLikeSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s NameLikeSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("name LIKE ?", fmt.Sprintf("%s%%", s))
		}
		return db
	}
}
