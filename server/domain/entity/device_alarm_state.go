package entity

type DeviceAlarmState struct {
	AlarmID uint `json:"alarm_id"`
	Record  struct {
		ID        uint  `json:"id"`
		Level     uint  `json:"level"`
		Timestamp int64 `json:"timestamp"`
	} `json:"record"`
}
