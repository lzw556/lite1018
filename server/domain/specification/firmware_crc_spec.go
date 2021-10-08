package specification

import "gorm.io/gorm"

type FirmwareCrc string

func (s FirmwareCrc) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s FirmwareCrc) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("crc = ?", s)
	}
}
