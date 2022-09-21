package openapivo

type DeviceData struct {
	Timestamp int64                  `json:"timestamp,omitempty"`
	Values    map[string]interface{} `json:"values,omitempty"`
}
