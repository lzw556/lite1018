package po

import "gorm.io/gorm"

type Asset struct {
	gorm.Model
	Name      string `gorm:"type:varchar(64)"`
	ParentID  uint
	ProjectID uint
}

func (Asset) TableName() string {
	return "ts_asset"
}

type Assets []Asset
