package specification

import (
	"gorm.io/gorm"
)

type AlarmRecordEqSpec uint

func (s AlarmRecordEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AlarmRecordEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("alarm_record_id = ?", s)
	}
}
