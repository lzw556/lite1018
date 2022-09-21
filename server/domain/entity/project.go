package entity

import "gorm.io/gorm"

type Project struct {
	gorm.Model
	Name        string `gorm:"type:varchar(64)"`
	Description string `gorm:"type:varchar(255)"`
	Token       string `gorm:"type:varchar(512)"`
}

func (Project) TableName() string {
	return "ts_project"
}

type Projects []Project
