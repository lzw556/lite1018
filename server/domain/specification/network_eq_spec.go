package specification

import "gorm.io/gorm"

type NetworkEqSpec uint

func (NetworkEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s NetworkEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("network_id = ?", s)
	}
}
