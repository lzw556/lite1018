package po

import "gorm.io/gorm"

type Project struct {
	gorm.Model
	Name        string `gorm:"type:varchar(64)"`
	Description string `gorm:"type:varchar(255)"`
	Picture     string `gorm:"type:varchar(255)"`
}

func (Project) TableName() string {
	return "ts_project"
}
