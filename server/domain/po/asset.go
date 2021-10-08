package po

import "gorm.io/gorm"

type Asset struct {
	gorm.Model
	Name string `gorm:"type:varchar(64)"`
}

func (Asset) TableName() string {
	return "ts_asset"
}
