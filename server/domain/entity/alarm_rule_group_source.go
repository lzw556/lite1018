package entity

import (
	"gorm.io/gorm"
)

type AlarmRuleGroupSource struct {
	gorm.Model
	GroupID     uint `gorm:"index;not null"`
	AlarmRuleID uint `gorm:"index;not null"`
}

func (AlarmRuleGroupSource) TableName() string {
	return "ts_alarm_rule_group_source"
}
