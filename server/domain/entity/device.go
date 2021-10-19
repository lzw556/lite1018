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
		socket.Emit("socket::deviceConnectionStateChanged", map[string]interface{}{
			"id":              d.ID,
			"connectionState": d.connectionState,
		})
	}
}

func (d Device) GetConnectionState() DeviceConnectionState {
	_ = cache.GetStruct(fmt.Sprintf("device_connection_status_%d", d.ID), &d.connectionState)
	return d.connectionState
}

func (d Device) UpdateAlarmState(alarmID uint, level uint) {
	key := fmt.Sprintf("device_alarm_state_%d", d.ID)
	_ = cache.GetStruct(key, &d.alarmState)
	if d.alarmState == nil {
		d.alarmState = map[uint]uint{}
	}
	d.alarmState[alarmID] = level
	_ = cache.SetStruct(key, d.alarmState)
}

func (d Device) GetAlarmState(alarmID uint) uint {
	_ = cache.GetStruct(fmt.Sprintf("device_alarm_state_%d", d.ID), &d.alarmState)
	return d.alarmState[alarmID]
}

func (d Device) GetAlertLevel() uint {
	_ = cache.GetStruct(fmt.Sprintf("device_alarm_state_%d", d.ID), &d.alarmState)
	alertLevel := uint(0)
	for _, v := range d.alarmState {
		if alertLevel < v {
			alertLevel = v
		}
		if alertLevel >= 3 {
			break
		}
	}
	return alertLevel
}

type Devices []Device
