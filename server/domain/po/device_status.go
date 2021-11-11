package po

type DeviceStatus struct {
	BatteryLevel         float32 `json:"batteryLevel"`
	SignalLevel          float32 `json:"signalLevel"`
	BatteryVoltage       int     `json:"batteryVoltage"`
	IsAcquisitionEnabled bool    `json:"isAcquisitionEnabled"`
}

func (DeviceStatus) BucketName() string {
	return "ts_device_status"
}
