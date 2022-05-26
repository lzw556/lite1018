package specification

import (
  "gorm.io/gorm"
)

type GroupIDEqSpec uint

func (s GroupIDEqSpec) IsSpecifiedBy(v interface{}) bool {
  return true
}

func (s GroupIDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
  return func(db *gorm.DB) *gorm.DB {
    if uint(s) == 0 {
      return db
    }
    return db.Where("group_id = ?", s)
  }
}
