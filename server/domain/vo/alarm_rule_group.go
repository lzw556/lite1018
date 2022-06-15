package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmRuleGroup struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    uint   `json:"category"`
	Type        uint   `json:"type"`
	Enabled     bool   `json:"status"`

	Rules            []*AlarmRule       `json:"rules"`
	MonitoringPoints []*MonitoringPoint `json:"monitoringPoints"`
}

func NewAlarmRuleGroup(e entity.AlarmRuleGroup) AlarmRuleGroup {
	return AlarmRuleGroup{
		ID:          e.ID,
		Name:        e.Name,
		Description: e.Description,
		Category:    e.Category,
		Type:        e.Type,
		Enabled:     e.IsEnabled(),

		Rules:            make([]*AlarmRule, 0),
		MonitoringPoints: make([]*MonitoringPoint, 0),
	}
}
