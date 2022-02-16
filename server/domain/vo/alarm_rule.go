package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
)

type AlarmRule struct {
	Field     string  `json:"field"`
	Method    string  `json:"method"`
	Threshold float32 `json:"threshold"`
	Operation string  `json:"operation"`
}

func NewAlarmRule(e entity.AlarmRule) AlarmRule {
	return AlarmRule{
		Field:     e.Field,
		Method:    e.Method,
		Threshold: e.Threshold,
		Operation: e.Operation,
	}
}

func (c AlarmRule) Description() string {
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
