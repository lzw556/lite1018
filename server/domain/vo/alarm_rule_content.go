package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type AlarmRuleContent struct {
	Field     string  `json:"field"`
	Method    string  `json:"method"`
	Threshold float32 `json:"threshold"`
	Operation string  `json:"operation"`
}

func NewAlarmRuleContent(e po.AlarmRuleContent) AlarmRuleContent {
	return AlarmRuleContent{
		Field:     e.Field,
		Method:    e.Method,
		Threshold: e.Threshold,
		Operation: e.Operation,
	}
}
