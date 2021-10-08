package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"time"
)

type Device struct {
	po.Device

	connectionState DeviceConnectionState
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
		socket.Emit("deviceConnectionStateChanged", map[string]interface{}{
			"id":              d.ID,
			"connectionState": d.connectionState,
		})
	}
}

func (d Device) GetConnectionState() DeviceConnectionState {
	_ = cache.GetStruct(fmt.Sprintf("device_connection_status_%d", d.ID), &d.connectionState)
	return d.connectionState
}

type Devices []Device
