package specification

import (
  "gorm.io/gorm"
)

type IDEqSpec uint

func (s IDEqSpec) IsSpecifiedBy(v interface{}) bool {
  return true
}

func (s IDEqSpec) Scope() func(db *gorm.DB) *gorm.DB {
  return func(db *gorm.DB) *gorm.DB {
    if uint(s) == 0 {
      return db
    }
    return db.Where("id = ?", s)
  }
}
