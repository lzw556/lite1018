package entity

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"time"
)

type DeviceConnectionState struct {
	IsOnline  bool  `json:"isOnline"`
	Timestamp int64 `json:"timestamp"`

	IsStatusChanged bool `json:"-"`
}

func (DeviceConnectionState) BucketName() string {
	return "ts_device_connection_state"
}

func NewDeviceConnectionState() *DeviceConnectionState {
	return &DeviceConnectionState{
		IsOnline: false,
	}
}

func (d *DeviceConnectionState) SetIsOnline(isOnline bool) {
	d.IsStatusChanged = d.IsOnline != isOnline
	d.IsOnline = isOnline
	d.Timestamp = time.Now().Unix()
}

func (d DeviceConnectionState) Notify(mac string) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceStateChangedEvent", map[string]interface{}{
		"macAddress": mac,
		"state": map[string]interface{}{
			"isOnline":    d.IsOnline,
			"connectedAt": d.Timestamp,
		},
	})
}
