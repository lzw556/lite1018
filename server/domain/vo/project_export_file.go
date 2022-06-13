package vo

type AssetExported struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`

	Children         []*AssetExported           `json:"children,omitempty"`
	MonitoringPoints []*MonitoringPointExported `json:"monitoringPoints,omitempty"`
}

type DeviceBinding struct {
	Address    string                 `json:"address"`
	ProcessID  uint                   `json:"processId"`
	Parameters map[string]interface{} `json:"parameters"`
}

type MonitoringPointExported struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Type uint   `json:"type"`

	Attributes map[string]interface{} `json:"attributes,omitempty"`
	Devices    []*DeviceBinding       `json:"devices"`
}

type ProjectExported struct {
	Assets   []*AssetExported     `json:"assets"`
	Networks []*NetworkExportFile `json:"networks"`
}
