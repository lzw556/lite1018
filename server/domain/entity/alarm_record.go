package entity

import "gorm.io/gorm"

type AlarmRecordStatus uint

const (
	AlarmRecordStatusUntreated AlarmRecordStatus = iota
	AlarmRecordStatusResolved
	AlarmRecordStatusRecovered
)

type AlarmRecord struct {
	gorm.Model
	AlarmRuleID      uint `gorm:"not null;index"`
	AlarmRuleGroupID uint
	SourceID         uint
	Metric           AlarmRuleMetric `gorm:"type:json"`
	Value            float64
	Level            uint8
	Threshold        float64
	Operation        string            `gorm:"type:varchar(8)"`
	Status           AlarmRecordStatus `gorm:"default:0;not null;"`
	ProjectID        uint              `gorm:"index"`
	Category         AlarmRuleCategory
	Acknowledged     bool `gorm:"default:false;not null;"`
}

func (AlarmRecord) TableName() string {
	return "ts_alarm_record"
}

func (a *AlarmRecord) Acknowledge() {
	a.Acknowledged = true
	a.Status = AlarmRecordStatusResolved
}

type AlarmRecords []AlarmRecord
