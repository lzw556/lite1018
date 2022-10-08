package openapivo

type AssetStatistics struct {
	AssetID uint `json:"assetId"`

	MonitoringPointNum uint   `json:"monitoringPointNum"`
	AlarmNum           []uint `json:"alarmNum"`
	DeviceNum          uint   `json:"deviceNum"`
	OfflineDeviceNum   uint   `json:"offlineDeviceNum"`
}

type Asset struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	ParentID   uint                   `json:"parentId"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`

	Statistics AssetStatistics `json:"statistics,omitempty"`
	AlertLevel uint            `json:"alertLevel"`
}
