package request

type Project struct {
	Name        string `json:"name" binding:"required,max=32,min=4"`
	Description string `json:"description"`
}

type AllocUsers struct {
	UserIDs []uint `json:"user_ids"`
}

type AssetImported struct {
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`

	Children         []*AssetImported           `json:"children,omitempty"`
	MonitoringPoints []*MonitoringPointImported `json:"monitoringPoints,omitempty"`
}

type MonitoringPointImported struct {
	Name string `json:"name"`
	Type uint   `json:"type"`

	Attributes map[string]interface{} `json:"attributes,omitempty"`
	Devices    []*DeviceBinding       `json:"devices"`
}

type DeviceBinding struct {
	Address    string                 `json:"address"`
	ProcessID  uint                   `json:"processId"`
	Parameters map[string]interface{} `json:"parameters"`
}

type NetworkImported struct {
	Wsn        WSN `json:"wsn"`
	DeviceList []struct {
		Name          string                            `json:"name"`
		Address       string                            `json:"address"`
		ParentAddress string                            `json:"parentAddress"`
		Type          uint                              `json:"type"`
		Settings      map[string]map[string]interface{} `json:"settings,omitempty"`
	} `json:"deviceList"`

	ProjectID uint `json:"-"`
}

type ProjectImported struct {
	Networks []NetworkImported `json:"networks"`
	Assets   []AssetImported   `json:"assets"`
}
