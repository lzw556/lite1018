package specification

import (
	"gorm.io/gorm"
	"time"
)

type CreatedAtRangeSpec [2]time.Time

func (s CreatedAtRangeSpec) IsSpecifiedBy(v interface{}) bool {
	return true
}

func (s CreatedAtRangeSpec) Scope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		start := s[0].Format("2006-01-02 15:04:05")
		stop := s[1].Format("2006-01-02 15:04:05")
		return db.Where("created_at BETWEEN ? AND ?", start, stop)
	}
}
