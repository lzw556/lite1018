package po

type DeviceSetting struct {
	IPN     IPNSetting    `json:"ipn,omitempty"`
	System  SystemSetting `json:"system,omitempty"`
	Sensors SensorSetting `json:"sensors,omitempty"`
}
