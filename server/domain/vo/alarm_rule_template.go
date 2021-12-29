package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AlarmTemplate struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	MeasurementType uint      `json:"measurementType"`
	Description     string    `json:"description"`
	Rule            AlarmRule `json:"rule"`
	Level           uint      `json:"level"`
}

func NewAlarmTemplate(e po.AlarmTemplate) AlarmTemplate {
	return AlarmTemplate{
		ID:              e.ID,
		Name:            e.Name,
		Level:           e.Level,
		MeasurementType: e.MeasurementType,
		Rule:            NewAlarmRule(e.Rule),
		Description:     e.Description,
	}
}
