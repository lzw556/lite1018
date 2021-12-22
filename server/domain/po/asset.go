package po

import "gorm.io/gorm"

type Asset struct {
	gorm.Model
	Name      string `gorm:"type:varchar(64)"`
	Image     string `gorm:"type:varchar(128)"`
	ParentID  uint
	ProjectID uint
	Display   Display `gorm:"type:json"`
}

func (Asset) TableName() string {
	return "ts_asset"
}

type Assets []Asset
