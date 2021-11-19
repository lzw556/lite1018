package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"time"
)

type Device struct {
	po.Device

	connectionState DeviceConnectionState
	upgradeState    DeviceUpgradeState
	alarmState      map[uint]uint
}

func (d Device) UpdateConnectionState(isOnline bool) {
	key := fmt.Sprintf("device_connection_status_%d", d.ID)
	_ = cache.GetStruct(key, &d.connectionState)
	isChanged := isOnline != d.connectionState.IsOnline
	d.connectionState.IsOnline = isOnline
	if isOnline {
		d.connectionState.ConnectedAt = time.Now().UTC().Unix()
	}
	_ = cache.SetStruct(key, d.connectionState)
	if isChanged {
		eventbus.Publish(eventbus.SocketEmit, "socket::deviceConnectionStateChanged", map[string]interface{}{
			"id":              d.ID,
			"connectionState": d.connectionState,
		})
	}
}

func (d Device) GetConnectionState() DeviceConnectionState {
	_ = cache.GetStruct(fmt.Sprintf("device_connection_status_%d", d.ID), &d.connectionState)
	return d.connectionState
}

func (d Device) UpdateUpgradeState(status DeviceUpgradeStatus, progress float32) {
	key := fmt.Sprintf("device_upgrade_state_%d", d.ID)
	_ = cache.GetStruct(key, &d.upgradeState)
	d.upgradeState.Status = status
	d.upgradeState.Progress = progress
	_ = cache.SetStruct(key, d.upgradeState)
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceUpgradeStateChanged", map[string]interface{}{
		"id":           d.ID,
		"upgradeState": d.upgradeState,
	})
}

func (d Device) CancelUpgrade() {
	upgradeState := d.GetUpgradeState()
	d.UpdateUpgradeState(DeviceUpgradeStatusCancelled, upgradeState.Progress)
}

func (d Device) GetUpgradeState() DeviceUpgradeState {
	_ = cache.GetStruct(fmt.Sprintf("device_upgrade_state_%d", d.ID), &d.upgradeState)
	return d.upgradeState
}

type Devices []Device
