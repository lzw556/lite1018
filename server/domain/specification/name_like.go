package specification

import (
	"fmt"
	"gorm.io/gorm"
)

type NameLike string

func (s NameLike) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s NameLike) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("name LIKE ?", fmt.Sprintf("%s%%", s))
		}
		return db
	}
}
