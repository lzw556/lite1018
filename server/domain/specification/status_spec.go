package specification

import (
	"gorm.io/gorm"
)

type Status uint

func (s Status) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s Status) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("status = ?", s)
	}
}
