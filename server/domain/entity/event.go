package entity

import "gorm.io/gorm"

type EventCategory uint32

const (
	EventTypeDataQcquisition   int32 = 0x01
	EventTypeSensorQcquisition int32 = 0x02
	EventTypeSensorAlarm       int32 = 0x11
	EventTypeSensorCalibrate   int32 = 0x12
	EventTypeDeviceReboot      int32 = 0x21
	EventTypeDeviceUpgrade     int32 = 0x22
	EventTypeDeviceLowPower    int32 = 0x23
	EventTypeFirmwareError     int32 = 0x24
	EventTypeDeviceStatus      int32 = 0x31
)

const (
	EventCategoryDevice EventCategory = iota + 1
)

type Event struct {
	gorm.Model
	Type      int32
	Code      int           `gorm:"not null;"`
	Category  EventCategory `gorm:"not null;"`
	SourceID  uint          `gorm:"not null;index"`
	Message   string        `gorm:"type:text;"`
	Timestamp int64         `gorm:"not null;"`
	ProjectID uint          `gorm:"index;"`
}

func (Event) TableName() string {
	return "ts_event"
}
