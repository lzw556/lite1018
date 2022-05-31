package entity

type DeviceStatus struct {
	Timestamp            int64   `json:"timestamp"`
	BatteryLevel         float32 `json:"batteryLevel"`
	SignalLevel          float32 `json:"signalLevel"`
	BatteryVoltage       int     `json:"batteryVoltage"`
	AcquisitionIsEnabled bool    `json:"acquisitionIsEnabled"`
}

func (DeviceStatus) BucketName() string {
	return "ts_device_state"
}

func (s DeviceStatus) Notify(mac string) {

}
