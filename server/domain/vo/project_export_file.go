package vo

type DeviceExported struct {
	ID            uint                              `json:"id"`
	Name          string                            `json:"name"`
	Address       string                            `json:"address"`
	ParentAddress string                            `json:"parentAddress"`
	Type          uint                              `json:"type"`
	Settings      map[string]map[string]interface{} `json:"settings"`
	Modbus        int                               `json:"modbus"`
}

type DevicesExported []DeviceExported

type NetworkExported struct {
	Wsn        map[string]interface{} `json:"wsn"`
	DeviceList ExportDevices          `json:"deviceList"`
}

type AssetExported struct {
	ID         uint                   `json:"id"`
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
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Type    uint   `json:"type"`
	AssetID uint   `json:"assetId"`

	Attributes map[string]interface{} `json:"attributes,omitempty"`
	Devices    []*DeviceBinding
}

type ProjectExported struct {
	Assets   []*AssetExported   `json:"assets"`
	Networks []*NetworkExported `json:"networks"`
}
