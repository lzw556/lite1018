package po

import "gorm.io/gorm"

type Measurement struct {
	gorm.Model
	Name string `gorm:"type:varchar(64);"`
}

func (Measurement) TableName() string {
	return "ts_measurement"
}
