package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
)

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

func (c AlarmRuleContent) Description() string {
	return fmt.Sprintf("属性【%s】的值: @%s设定的阈值:%.3f", devicetype.GetFieldName(c.Field), operation(c.Operation), c.Threshold)
}

func operation(op string) string {
	switch op {
	case ">", ">=":
		return "高于"
	case "<", "<=":
		return "低于"
	}
	return ""
}
