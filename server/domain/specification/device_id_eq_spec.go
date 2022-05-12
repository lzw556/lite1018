package specification

import (
  "fmt"
  "gorm.io/gorm"
)

type DeviceIDEqSpec uint

func (s DeviceIDEqSpec) IsSpecifiedBy(v interface{}) bool {
  return true
}

func (s DeviceIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
  return func(db *gorm.DB) *gorm.DB {
    if uint(s) == 0 {
      return db
    }
    return db.Where("device_id = ?", s)
  }
}
