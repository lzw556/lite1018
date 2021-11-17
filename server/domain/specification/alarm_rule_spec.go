package specification

import (
	"gorm.io/gorm"
)

type AlarmRule uint

func (s AlarmRule) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AlarmRule) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("alarm_id = ?", s)
	}
}
