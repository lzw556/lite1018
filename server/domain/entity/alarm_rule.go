package entity

import "gorm.io/gorm"

type AlarmRuleType uint8

const (
	AlarmRuleTypeDevice AlarmRuleType = iota + 1
	AlarmRuleTypeAsset
)

type AlarmRule struct {
	gorm.Model
	Name        string          `gorm:"type:varchar(30)"`
	Description string          `gorm:"type:varchar(128)"`
	SourceType  string          `gorm:"type:varchar(32)"`
	Metric      AlarmRuleMetric `gorm:"type:json"`
	Duration    int
	Threshold   float64
	Operation   string `gorm:"type:varchar(8)"`
	Level       uint8
	Enabled     bool
}

func (AlarmRule) TableName() string {
	return "ts_alarm_rule"
}

func (a AlarmRule) RuleSpec() string {
	return ``
}

type AlarmRules []AlarmRule
