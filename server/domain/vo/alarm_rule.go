package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AlarmRule struct {
	ID          uint                   `json:"id"`
	Name        string                 `json:"name"`
	Duration    int                    `json:"duration"`
	Operation   string                 `json:"operation"`
	Threshold   float64                `json:"threshold"`
	Level       uint8                  `json:"level"`
	Sources     interface{}            `json:"sources,omitempty"`
	SourceType  uint                   `json:"sourceType"`
	Metric      entity.AlarmRuleMetric `json:"metric"`
	Description string                 `json:"description"`
	Enabled     bool                   `json:"enabled"`
	Category    uint8                  `json:"category"`
	CreatedAt   int64                  `json:"createdAt"`
}

func NewAlarmRule(e entity.AlarmRule) AlarmRule {
	return AlarmRule{
		ID:          e.ID,
		Name:        e.Name,
		Duration:    e.Duration,
		Operation:   e.Operation,
		Description: e.Description,
		Threshold:   e.Threshold,
		SourceType:  e.SourceType,
		Metric:      e.Metric,
		Level:       e.Level,
		Enabled:     e.IsEnabled(),
		Category:    uint8(e.Category),
		CreatedAt:   e.CreatedAt.UTC().Unix(),
	}
}
