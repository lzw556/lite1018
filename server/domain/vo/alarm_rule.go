package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type Alarm struct {
	ID          uint        `json:"id"`
	Name        string      `json:"name"`
	Measurement Measurement `json:"measurement"`
	Rule        AlarmRule   `json:"rule"`
	Level       uint        `json:"level"`
	Enabled     bool        `json:"enabled"`
}

func NewAlarm(e po.Alarm) Alarm {
	return Alarm{
		ID:      e.ID,
		Name:    e.Name,
		Rule:    NewAlarmRule(e.Rule),
		Level:   e.Level,
		Enabled: e.Enabled,
	}
}
