package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRule struct {
	ID       uint             `json:"id"`
	Name     string           `json:"name"`
	Device   Device           `json:"device"`
	Property Property         `json:"property"`
	Rule     AlarmRuleContent `json:"rule"`
	Level    uint             `json:"level"`
	Enabled  bool             `json:"enabled"`
}

func NewAlarmRule(e po.AlarmRule) AlarmRule {
	return AlarmRule{
		ID:      e.ID,
		Name:    e.Name,
		Rule:    NewAlarmRuleContent(e.Rule),
		Level:   e.Level,
		Enabled: e.Enabled,
	}
}

func (a *AlarmRule) SetDevice(e entity.Device) {
	a.Device = NewDevice(e)
}

func (a *AlarmRule) SetProperty(e po.Property) {
	a.Property = NewProperty(e)
}
