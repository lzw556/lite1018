package specification

import (
	"gorm.io/gorm"
)

type AlarmRuleEqSpec uint

func (s AlarmRuleEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AlarmRuleEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("alarm_id = ?", s)
	}
}
