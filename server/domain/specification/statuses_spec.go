package specification

import (
	"gorm.io/gorm"
)

type Statuses []uint

func (s Statuses) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s Statuses) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("status IN ?", s)
	}
}
