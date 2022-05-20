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
