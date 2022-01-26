package po

import (
	"gorm.io/gorm"
)

type DeviceCategory uint

const (
	GatewayCategory DeviceCategory = iota + 1
	RouterCategory
	SensorCategory
)

type Device struct {
	gorm.Model
	Name       string `gorm:"type:varchar(64)"`
	MacAddress string `gorm:"type:varchar(12)"`
	Type       uint
	NetworkID  uint
	ProjectID  uint
	Category   DeviceCategory
	Settings   DeviceSettings `gorm:"type:json"`
}

func (Device) TableName() string {
	return "ts_device"
}

type Devices []Device
