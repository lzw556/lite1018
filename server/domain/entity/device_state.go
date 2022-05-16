package entity

import "github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"

type DeviceState struct {
	BatteryLevel         float32 `json:"batteryLevel"`
	SignalLevel          float32 `json:"signalLevel"`
	BatteryVoltage       int     `json:"batteryVoltage"`
	AcquisitionIsEnabled bool    `json:"acquisitionIsEnabled"`
	IsOnline             bool    `json:"isOnline"`
	ConnectedAt          int64   `json:"connectedAt"`
}

func (DeviceState) BucketName() string {
	return "ts_device_state"
}

func (s DeviceState) Notify(mac string) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceStateChangedEvent", map[string]interface{}{
		"macAddress": mac,
		"state":      s,
	})
}
