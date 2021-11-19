package entity

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type DeviceAlertState struct {
	States []DeviceAlarmState `json:"states"`
}

func (DeviceAlertState) BucketName() string {
	return "ts_device_alert_state"
}

func (d *DeviceAlertState) UpdateAlarmState(alarmID uint, record po.AlarmRecord) {
	for i, state := range d.States {
		if state.AlarmID == alarmID {
			state.Record.ID = record.ID
			state.Record.Level = record.Level
			state.Record.Timestamp = record.CreatedAt.Unix()
			d.States[i] = state
			return
		}
	}
	state := DeviceAlarmState{
		AlarmID: alarmID,
	}
	state.Record.ID = record.ID
	state.Record.Level = record.Level
	state.Record.Timestamp = record.CreatedAt.Unix()
	d.States = append(d.States, state)
}

func (d DeviceAlertState) GetAlarmState(alarmID uint) DeviceAlarmState {
	for _, state := range d.States {
		if state.AlarmID == alarmID {
			return state
		}
	}
	return DeviceAlarmState{}
}

func (d DeviceAlertState) GetRecentlyHighLevelAlarmState() DeviceAlarmState {
	result := DeviceAlarmState{}
	for _, state := range d.States {
		if result.Record.Level < state.Record.Level {
			result = state
		} else if result.Record.Level == state.Record.Level && result.Record.Timestamp < state.Record.Timestamp {
			result = state
		}
	}
	return result
}

func (d *DeviceAlertState) RemoveAlarmState(alarmID uint) {
	idx := 0
	for i, state := range d.States {
		if state.AlarmID == alarmID {
			idx = i
			break
		}
	}
	d.States = append(d.States[:idx], d.States[idx+1:]...)
}

func (d *DeviceAlertState) Acknowledged(recordID uint) {
	idx := 0
	for i, state := range d.States {
		if state.Record.ID == recordID {
			idx = i
			break
		}
	}
	d.States = append(d.States[:idx], d.States[idx+1:]...)
}

func (d DeviceAlertState) GetLevel() uint {
	level := uint(0)
	for _, state := range d.States {
		if state.Record.Level > level {
			level = state.Record.Level
		}
		if level > 3 {
			break
		}
	}
	return level
}
