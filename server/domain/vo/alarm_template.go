package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmTemplate struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Rule        AlarmRule `json:"rule"`
	Level       uint      `json:"level"`
}

func NewAlarmTemplate(e entity.AlarmTemplate) AlarmTemplate {
	return AlarmTemplate{
		ID:          e.ID,
		Name:        e.Name,
		Level:       e.Level,
		Rule:        NewAlarmRule(e.Rule),
		Description: e.Description,
	}
}
