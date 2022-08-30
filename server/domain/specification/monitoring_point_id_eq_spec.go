package specification

import (
  "gorm.io/gorm"
)

type MonitoringPointIDEqSpec uint

func (s MonitoringPointIDEqSpec) IsSpecifiedBy(v interface{}) bool {
  return true
}

func (s MonitoringPointIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
  return func(db *gorm.DB) *gorm.DB {
    if uint(s) == 0 {
      return db
    }
    return db.Where("monitoring_point_id = ?", s)
  }
}
