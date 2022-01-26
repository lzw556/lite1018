package specification

import "gorm.io/gorm"

type MeasurementInSpec []uint

func (s MeasurementInSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s MeasurementInSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("measurement_id IN (?)", s)
	}
}
