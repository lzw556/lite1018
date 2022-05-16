package specification

import (
	"gorm.io/gorm"
)

type AlarmRuleInSpec []uint

func (s AlarmRuleInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AlarmRuleInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("alarm_rule_id IN (?)", s)
		}
		return db.Where("alarm_rule_id IN (0)")
	}
}
