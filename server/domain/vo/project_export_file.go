package vo

type AssetExported struct {
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	ParentID   uint                   `json:"parentId"`
	ProjectID  uint                   `json:"projectId"`
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
	Name string `json:"name"`
	Type uint   `json:"type"`

	Attributes map[string]interface{} `json:"attributes,omitempty"`
	Devices    []*DeviceBinding
}

type ProjectExported struct {
	Assets   []*AssetExported     `json:"assets"`
	Networks []*NetworkExportFile `json:"networks"`
}
