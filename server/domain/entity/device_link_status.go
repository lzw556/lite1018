package entity

import "gorm.io/gorm"

type DeviceLinkStatus struct {
	gorm.Model
	MacAddress             string `gorm:"type:varchar(12);index"`
	State                  string `gorm:"type:varchar(10)"`
	Status                 int
	LastConnection         uint
	LastCall               uint
	LastProvisioning       uint
	NumProvisioningRetries uint
	StateUpdateTime        int64
}

func (DeviceLinkStatus) TableName() string {
	return "ts_device_link_status"
}
