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

func NewAlarm(e entity.AlarmRule) Alarm {
	return Alarm{}
}
