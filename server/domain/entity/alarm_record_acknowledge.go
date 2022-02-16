package entity

import "gorm.io/gorm"

type AlarmRecordAcknowledge struct {
	gorm.Model
	ID            uint `json:"id"`
	AlarmRecordID uint
	UserID        uint
	Note          string `gorm:"type:text"`
}

func (AlarmRecordAcknowledge) TableName() string {
	return "ts_alarm_record_acknowledge"
}
