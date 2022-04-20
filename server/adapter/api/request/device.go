package request

type CreateDevice struct {
	Name       string                 `json:"name" binding:"max=20,min=2"`
	MacAddress string                 `json:"mac_address" binding:"required,lowercase,len=12"`
	TypeID     uint                   `json:"type" binding:"required"`
	NetworkID  uint                   `json:"network,omitempty"`
	ParentID   uint                   `json:"parent,omitempty"`
	IPN        map[string]interface{} `json:"ipn,omitempty"`
	System     map[string]interface{} `json:"system,omitempty"`
	Sensors    map[string]interface{} `json:"sensors,omitempty"`

	ProjectID uint `json:"-"`
}

type UpdateDevice struct {
	Name       string `json:"name" binding:"max=20,min=2"`
	MacAddress string `json:"mac_address" binding:"required,lowercase,len=12"`
	NetworkID  uint   `json:"network" binding:"required"`
	Parent     string `json:"parent" binding:"required,lowercase,len=12"`
}

type DeviceSearch struct {
	Target string      `json:"target"`
	Text   interface{} `json:"text"`
}

type DeviceSetting struct {
	IPN     map[string]interface{} `json:"ipn"`
	Sensors map[string]interface{} `json:"sensors"`
	System  map[string]interface{} `json:"system"`
}

type DeviceUpgrade struct {
	FirmwareID uint `json:"firmware_id"`
	Type       uint `json:"type"`
}

type DeviceCommand struct {
	Param float32 `json:"param"`
}

type DeviceAlarmRules struct {
	IDs []uint `json:"ids"`
}
