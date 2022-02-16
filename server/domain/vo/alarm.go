package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Alarm struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Rule      AlarmRule `json:"rule"`
	Level     uint      `json:"level"`
	Enabled   bool      `json:"enabled"`
	CreatedAt int64     `json:"createdAt"`
}

func NewAlarm(e entity.Alarm) Alarm {
	return Alarm{
		ID:        e.ID,
		Name:      e.Name,
		Rule:      NewAlarmRule(e.Rule),
		Level:     e.Level,
		Enabled:   e.Enabled,
		CreatedAt: e.CreatedAt.UTC().Unix(),
	}
}
