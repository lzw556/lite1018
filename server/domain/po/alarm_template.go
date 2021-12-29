package po

import "gorm.io/gorm"

type AlarmTemplate struct {
	gorm.Model
	Name            string `gorm:"type:varchar(30)"`
	MeasurementType uint
	Rule            AlarmRule `gorm:"type:json"`
	Level           uint
	Description     string `gorm:"type:varchar(255)"`
}

func (AlarmTemplate) TableName() string {
	return "ts_alarm_template"
}
