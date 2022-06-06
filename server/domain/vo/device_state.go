package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type DeviceState struct {
	IsOnline             bool    `json:"isOnline"`
	ConnectedAt          int64   `json:"connectedAt"`
	BatteryLevel         float32 `json:"batteryLevel"`
	SignalLevel          float32 `json:"signalLevel"`
	BatteryVoltage       int     `json:"batteryVoltage"`
	AcquisitionIsEnabled bool    `json:"acquisitionIsEnabled"`
}

func NewDeviceState(e entity.DeviceStatus) DeviceState {
	return DeviceState{
		BatteryLevel:         e.BatteryLevel,
		SignalLevel:          e.SignalLevel,
		BatteryVoltage:       e.BatteryVoltage,
		AcquisitionIsEnabled: e.AcquisitionIsEnabled,
		IsOnline:             false,
	}
}
