package entity

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"time"
)

type DeviceConnectionStatus int

const (
	DeviceConnectionStatusOnline  DeviceConnectionStatus = 0
	DeviceConnectionStatusLost    DeviceConnectionStatus = 1
	DeviceConnectionStatusOffline DeviceConnectionStatus = 2
)

type DeviceConnectionState struct {
	Status    DeviceConnectionStatus `json:"status"`
	Timestamp int64                  `json:"timestamp"`

	IsStatusChanged bool `json:"-"`
}

func (DeviceConnectionState) BucketName() string {
	return "ts_device_connection_state"
}

func NewDeviceConnectionState() *DeviceConnectionState {
	return &DeviceConnectionState{
		Status: DeviceConnectionStatusOffline,
	}
}

func (d DeviceConnectionState) IsOnline() bool {
	switch d.Status {
	case DeviceConnectionStatusOnline:
		return true
	default:
		return false
	}
}

func (d *DeviceConnectionState) SetStatus(status DeviceConnectionStatus) {
	d.IsStatusChanged = d.Status != status
	d.Status = status
	d.Timestamp = time.Now().Unix()
}

func (d DeviceConnectionState) Notify(mac string) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceStateChangedEvent", map[string]interface{}{
		"macAddress": mac,
		"state": map[string]interface{}{
			"isOnline":    d.IsOnline(),
			"connectedAt": d.Timestamp,
		},
	})
}
