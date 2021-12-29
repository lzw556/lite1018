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
	AssetID    uint
	Category   DeviceCategory
	IPN        IPNSetting    `gorm:"type:json;column:ipn"`
	System     SystemSetting `gorm:"type:json"`
	Sensors    SensorSetting `gorm:"type:json"`
}

func (Device) TableName() string {
	return "ts_device"
}

func (d *Device) SetIPN(ipn IPNSetting) {
	d.IPN = IPNSetting{}
	for _, key := range IPNSettingKeys {
		if value, ok := ipn[key]; ok {
			d.IPN[key] = value
		}
	}
}

func (d *Device) SetSystem(system SystemSetting) {

}

func (d *Device) SetSensors(sensor SensorSetting) {
	d.Sensors = SensorSetting{}
	for _, key := range SensorSettingKeys[d.Type] {
		if value, ok := sensor[key]; ok {
			d.Sensors[key] = value
		}
	}
}

type Devices []Device
