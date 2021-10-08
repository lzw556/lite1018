package specification

import "gorm.io/gorm"

type NetworkSpec uint

func (NetworkSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s NetworkSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("network_id = ?", s)
	}
}
