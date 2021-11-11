package po

type DeviceAlertStatus struct {
	Alarm struct {
		ID    uint   `json:"id"`
		Field string `json:"field"`
	} `json:"alarm"`
	Level   uint   `json:"level"`
	Content string `json:"content"`
}

func (DeviceAlertStatus) BucketName() string {
	return "ts_device_alert_status"
}
