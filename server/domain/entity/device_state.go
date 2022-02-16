package entity

type DeviceState struct {
	BatteryLevel         float32 `json:"batteryLevel"`
	SignalLevel          float32 `json:"signalLevel"`
	BatteryVoltage       int     `json:"batteryVoltage"`
	IsAcquisitionEnabled bool    `json:"isAcquisitionEnabled"`
	IsOnline             bool    `json:"isOnline"`
	ConnectedAt          int64   `json:"connectedAt"`
}

func (DeviceState) BucketName() string {
	return "ts_device_state"
}
