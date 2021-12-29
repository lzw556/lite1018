package po

import "gorm.io/gorm"

type AlarmRecordStatus uint

const (
	AlarmRecordStatusUntreated AlarmRecordStatus = iota
	AlarmRecordStatusResolved
	AlarmRecordStatusRecovered
)

type AlarmRecord struct {
	gorm.Model
	AlarmID       uint
	MeasurementID uint
	Rule          AlarmRule `gorm:"type:json"`
	Value         float32
	Level         uint
	Status        AlarmRecordStatus `gorm:"default:0;not null;"`
	IsActive      bool              `gorm:"default:true;not null;"`
	Acknowledged  bool              `gorm:"default:false;not null;"`
}

func (AlarmRecord) TableName() string {
	return "ts_alarm_record"
}
