package po

import (
	"gorm.io/gorm"
)

type AcquisitionMode uint

const (
	TriggerAcquisitionMode AcquisitionMode = iota
	PollingAcquisitionMode
)

type Measurement struct {
	gorm.Model
	Name           string `gorm:"type:varchar(64);"`
	Type           uint
	AssetID        uint
	Settings       Settings        `gorm:"type:json"`
	SensorSettings DeviceSettings  `gorm:"type:json"`
	Mode           AcquisitionMode `gorm:"not null;default:0"`
	PollingPeriod  uint            `gorm:"not null;default:1200000"`
	Display        Display         `gorm:"type:json"`
}

func (Measurement) TableName() string {
	return "ts_measurement"
}

type Measurements []Measurement
