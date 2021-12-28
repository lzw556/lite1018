package specification

import "gorm.io/gorm"

type SampleMethodEqSpec uint

func (s SampleMethodEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s SampleMethodEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("sample_method = ?", s)
	}
}
