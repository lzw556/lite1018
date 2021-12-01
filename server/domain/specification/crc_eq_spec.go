package specification

import "gorm.io/gorm"

type CrcEqSpec string

func (s CrcEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s CrcEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("crc = ?", s)
	}
}
