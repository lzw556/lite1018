package specification

import "gorm.io/gorm"

type PrimaryKeyInSpec []uint

func (PrimaryKeyInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s PrimaryKeyInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if len(s) > 0 {
			return db.Where("id IN ?", s)
		}
		return db.Where("id IN ?", []uint{0})
	}
}
