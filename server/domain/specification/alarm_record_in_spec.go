package specification

import (
	"gorm.io/gorm"
)

type AlarmRecordInSpec []uint

func (s AlarmRecordInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AlarmRecordInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("alarm_record_id IN (?)", s)
		}
		return db.Where("alarm_record_id IN (0)")
	}
}
