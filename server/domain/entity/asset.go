package entity

import (
	"gorm.io/gorm"
)

const (
	AssetTypeGeneral    = 100
	AssetTypeWindTurine = 101
	AssetTypeFlange     = 102
	AssetTypeUnknown    = 9999
)

type Asset struct {
	gorm.Model
	Name       string `gorm:"type:varchar(64)"`
	Type       uint
	ParentID   uint
	Attributes Attributes

	ProjectID uint
}

func (Asset) TableName() string {
	return "ts_asset"
}

type Assets []Asset

func (as Assets) Len() int {
	return len(as)
}

func (as Assets) Less(i, j int) bool {
	return as[i].ID < as[j].ID
}

func (as Assets) Swap(i, j int) {
	as[i], as[j] = as[j], as[i]
}
