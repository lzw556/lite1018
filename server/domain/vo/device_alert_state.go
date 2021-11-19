package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type DeviceAlertState struct {
	Level  uint `json:"level"`
	Record struct {
		ID        uint  `json:"id"`
		Timestamp int64 `json:"timestamp"`
	} `json:"record"`
}

func NewDeviceAlertState(e entity.DeviceAlertState) DeviceAlertState {
	result := DeviceAlertState{}
	alarmState := e.GetRecentlyHighLevelAlarmState()
	result.Record.ID = alarmState.Record.ID
	result.Record.Timestamp = alarmState.Record.Timestamp
	result.Level = alarmState.Record.Level
	return result
}
