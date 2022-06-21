package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmRecord struct {
	ID                 uint                   `json:"id"`
	AlarmRuleGroupName string                 `json:"alarmRuleGroupName"`
	AlarmRuleGroupID   uint                   `json:"alarmRuleGroupId"`
	Metric             entity.AlarmRuleMetric `json:"metric"`
	Source             interface{}            `json:"source"`
	SourceType         string                 `json:"sourceType"`
	Operation          string                 `json:"operation"`
	Level              uint8                  `json:"level"`
	Value              float64                `json:"value"`
	Threshold          float64                `json:"threshold"`
	Status             uint                   `json:"status"`
	Acknowledged       bool                   `json:"acknowledged"`
	Category           uint8                  `json:"category"`
	CreatedAt          int64                  `json:"createdAt"`
	UpdatedAt          int64                  `json:"updatedAt"`
}

func NewAlarmRecord(e entity.AlarmRecord) AlarmRecord {
	return AlarmRecord{
		ID:               e.ID,
		AlarmRuleGroupID: e.AlarmRuleGroupID,
		Metric:           e.Metric,
		Level:            e.Level,
		Value:            e.Value,
		Threshold:        e.Threshold,
		Operation:        e.Operation,
		Status:           uint(e.Status),
		Acknowledged:     e.Acknowledged,
		Category:         uint8(e.Category),
		CreatedAt:        e.CreatedAt.UTC().Unix(),
		UpdatedAt:        e.UpdatedAt.UTC().Unix(),
	}
}
