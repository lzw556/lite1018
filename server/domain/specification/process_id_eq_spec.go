package specification

import (
  "gorm.io/gorm"
)

type ProcessIDEqSpec uint

func (s ProcessIDEqSpec) IsSpecifiedBy(v interface{}) bool {
  return true
}

func (s ProcessIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
  return func(db *gorm.DB) *gorm.DB {
    return db.Where("process_id = ?", s)
  }
}
