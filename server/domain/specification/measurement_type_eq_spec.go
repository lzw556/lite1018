package specification

import (
	"gorm.io/gorm"
)

type MeasurementTypeEqSpec uint

func (s MeasurementTypeEqSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s MeasurementTypeEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("measurement_type = ?", s)
	}
}
