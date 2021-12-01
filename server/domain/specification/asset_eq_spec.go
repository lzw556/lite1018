package specification

import "gorm.io/gorm"

type AssetEqSpec uint

func (s AssetEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s AssetEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if s > 0 {
			return db.Where("asset_id = ?", s)
		}
		return db
	}
}
