package openapivo

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
