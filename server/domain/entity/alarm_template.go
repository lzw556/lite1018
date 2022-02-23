package entity

import "gorm.io/gorm"

type AlarmTemplate struct {
	gorm.Model
	Name        string `gorm:"type:varchar(30)"`
	ProjectID   uint   `gorm:"not null;default:0"`
	Level       uint
	Description string `gorm:"type:varchar(255)"`
}

func (AlarmTemplate) TableName() string {
	return "ts_alarm_template"
}
