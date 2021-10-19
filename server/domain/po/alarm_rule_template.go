package po

import "gorm.io/gorm"

type AlarmRuleTemplate struct {
	gorm.Model
	Name         string `gorm:"type:varchar(30)"`
	DeviceTypeID uint
	PropertyID   uint
	Rule         AlarmRuleContent `gorm:"type:json"`
	Level        uint
	Description  string `gorm:"type:varchar(255)"`
}

func (AlarmRuleTemplate) TableName() string {
	return "ts_alarm_rule_template"
}
