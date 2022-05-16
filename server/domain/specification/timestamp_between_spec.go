package specification

import (
	"gorm.io/gorm"
)

type TimestampBetweenSpec [2]int64

func (s TimestampBetweenSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s TimestampBetweenSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("timestamp BETWEEN ? AND ?", s[0], s[1])
	}
}
