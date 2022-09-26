package openapivo

type MonitoringPoint struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Type    uint   `json:"type"`
	AssetID uint   `json:"assetId"`

	Attributes  map[string]interface{} `json:"attributes,omitempty"`
	AlertStates []AlertState           `json:"alertStates,omitempty"`
	AlertLevel  uint                   `json:"alertLevel"`
}
