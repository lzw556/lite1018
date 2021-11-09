package po

import "gorm.io/gorm"

type AssetType uint

const (
	DefaultAssetType AssetType = iota
)

type Asset struct {
	gorm.Model
	Name string `gorm:"type:varchar(64)"`
	Type AssetType
}

func (Asset) TableName() string {
	return "ts_asset"
}

type Assets []Asset
