package entity

import "gorm.io/gorm"

type EventCategory uint32

const (
	EventCategoryDevice EventCategory = iota + 1
)

type Event struct {
	gorm.Model
	Code      EventCode     `gorm:"not null;"`
	Category  EventCategory `gorm:"not null;"`
	SourceID  uint          `gorm:"not null;index"`
	Content   string        `gorm:"type:text;"`
	Timestamp int64         `gorm:"not null;"`
	Type      uint
	ProjectID uint `gorm:"index;"`
}

func (Event) TableName() string {
	return "ts_event"
}
