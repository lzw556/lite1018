package po

import "gorm.io/gorm"

type AlarmRecord struct {
	gorm.Model
	AlarmID    uint
	DeviceID   uint
	PropertyID uint
	Rule       AlarmRuleContent `gorm:"type:json"`
	Value      float32
	Level      uint
}

func (AlarmRecord) TableName() string {
	return "ts_alarm_record"
}

type AlarmRecords []AlarmRecord
