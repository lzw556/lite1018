package po

import "gorm.io/gorm"

type AlarmRule struct {
	gorm.Model
	Name        string `gorm:"type:varchar(30)"`
	Description string `gorm:"type:varchar(128)"`
	DeviceID    uint
	PropertyID  uint
	Rule        AlarmRuleContent `gorm:"type:json"`
	Level       uint
	Enabled     bool `gorm:"default:1;not null"`
}

func (AlarmRule) TableName() string {
	return "ts_alarm_rule"
}

type AlarmRules []AlarmRule
