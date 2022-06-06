package request

type CreateMonitoringPoint struct {
	Name       string                 `json:"name" binding:"max=20,min=2"`
	Type       uint                   `json:"type" binding:"required"`
	AssetID    uint                   `json:"asset_id" binding:"required"`
	Attributes map[string]interface{} `json:"attributes"`

	ProjectID uint `json:"-"`
}

type UpdateMonitoringPoint struct {
	Name       string                 `json:"name" binding:"max=20,min=2"`
	Type       uint                   `json:"type" binding:"required"`
	AssetID    uint                   `json:"asset_id" binding:"required"`
	Attributes map[string]interface{} `json:"attributes"`
}

type BindDevice struct {
	DeviceID   uint                   `json:"device_id" binding:"required"`
	ProcessID  uint                   `json:"process_id" binding:"required"`
	Parameters map[string]interface{} `json:"parameters"`
}

type UnbindDevice struct {
	DeviceID uint `json:"device_id" binding:"required"`
}
