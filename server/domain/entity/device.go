package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
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
	Settings   DeviceSettings `gorm:"type:json"`

	State DeviceState `gorm:"-"`
}

func (Device) TableName() string {
	return "ts_device"
}

func (d Device) GetUpgradeStatus() DeviceUpgradeStatus {
	status := DeviceUpgradeStatus{}
	_ = cache.GetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), &status)
	return status
}

func (d Device) UpdateDeviceUpgradeStatus(code DeviceUpgradeCode, progress float32) {
	status := DeviceUpgradeStatus{
		Code:     code,
		Progress: progress,
	}
	d.UpgradeNotify(status)
	_ = cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status)
}

func (d Device) CancelUpgrade() {
	status := d.GetUpgradeStatus()
	status.Code = DeviceUpgradeCancelled
	d.UpgradeNotify(status)
	_ = cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status)
}

func (d Device) UpgradeNotify(status DeviceUpgradeStatus) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceUpgradeStatusChangedEvent", map[string]interface{}{
		"macAddress": d.MacAddress,
		"code":       status.Code,
		"progress":   status.Progress,
	})
}

type Devices []Device
