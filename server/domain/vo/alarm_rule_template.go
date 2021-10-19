package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AlarmRuleTemplate struct {
	ID          uint             `json:"id"`
	Name        string           `json:"name"`
	DeviceType  uint             `json:"deviceType"`
	Description string           `json:"description"`
	Property    Property         `json:"property"`
	Rule        AlarmRuleContent `json:"rule"`
	Level       uint             `json:"level"`
}

func NewAlarmRuleTemplate(e po.AlarmRuleTemplate) AlarmRuleTemplate {
	return AlarmRuleTemplate{
		ID:          e.ID,
		Name:        e.Name,
		DeviceType:  e.DeviceTypeID,
		Level:       e.Level,
		Description: e.Description,
	}
}

func (t *AlarmRuleTemplate) SetProperty(e po.Property) {
	t.Property = NewProperty(e)
}

func (t *AlarmRuleTemplate) SetRule(e po.AlarmRuleContent) {
	t.Rule = AlarmRuleContent{
		Field:     e.Field,
		Method:    e.Method,
		Operation: e.Operation,
		Threshold: e.Threshold,
	}
}
