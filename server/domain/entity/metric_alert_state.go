package entity

type MetricAlertState struct {
	Metric   AlarmRuleMetric `json:"metric"`
	Duration int             `json:"duration"`
	Level    uint8           `json:"level"`
}
