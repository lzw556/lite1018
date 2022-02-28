package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmRecord struct {
	ID           uint                   `json:"id"`
	Metric       entity.AlarmRuleMetric `json:"metric"`
	Source       interface{}            `json:"source"`
	SourceType   string                 `json:"sourceType"`
	Operation    string                 `json:"operation"`
	Level        uint8                  `json:"level"`
	Value        float64                `json:"value"`
	Status       uint                   `json:"status"`
	Acknowledged bool                   `json:"acknowledged"`
	CreatedAt    int64                  `json:"createdAt"`
	UpdatedAt    int64                  `json:"updatedAt"`
}

func NewAlarmRecord(e entity.AlarmRecord) AlarmRecord {
	return AlarmRecord{
		ID:           e.ID,
		SourceType:   e.SourceType,
		Metric:       e.Metric,
		Level:        e.Level,
		Value:        e.Value,
		Operation:    e.Operation,
		Status:       uint(e.Status),
		Acknowledged: e.Acknowledged,
		CreatedAt:    e.CreatedAt.UTC().Unix(),
		UpdatedAt:    e.UpdatedAt.UTC().Unix(),
	}
}
