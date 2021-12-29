package specification

import (
	"gorm.io/gorm"
)

type MeasurementEqSpec uint

func (s MeasurementEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s MeasurementEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("measurement_id = ?", s)
	}
}
