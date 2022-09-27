package openapivo

type MonitoringPointData struct {
	Timestamp int64                  `json:"timestamp"`
	Values    map[string]interface{} `json:"values,omitempty"`
}
