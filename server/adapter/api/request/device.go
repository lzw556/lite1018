package request

type Device struct {
	Name       string                 `json:"name"`
	MacAddress string                 `json:"mac_address,omitempty"`
	TypeID     uint                   `json:"type_id,omitempty"`
	NetworkID  uint                   `json:"network_id,omitempty"`
	IPN        map[string]interface{} `json:"ipn,omitempty"`
	System     map[string]interface{} `json:"system,omitempty"`
	Sensors    map[string]interface{} `json:"sensors,omitempty"`

	WSN *WSN `json:"wsn,omitempty"`
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
