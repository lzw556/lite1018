package specification

import "gorm.io/gorm"

type PrimaryKeysSpec []uint

func (PrimaryKeysSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s PrimaryKeysSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("id IN ?", s)
		}
		return db.Where("id IN ?", []uint{0})
	}
}
