package entity

import (
	"gorm.io/gorm"
)

const (
	AssetTypeGeneral = iota + 1
	AssetTypeWindTurine
	AssetTypeFlange
	AssetTypeUnknown
)

type Asset struct {
	gorm.Model
	Name      string `gorm:"type:varchar(64)"`
	Type      uint
	ParentID  uint
	ProjectID uint
}

func (Asset) TableName() string {
	return "ts_asset"
}
