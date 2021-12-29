package request

type WSN struct {
	CommunicationPeriod     uint `json:"communication_period"`
	CommunicationTimeOffset uint `json:"communication_time_offset"`
	GroupSize               uint `json:"group_size"`
	GroupInterval           uint `json:"group_interval"`
}

type Network struct {
	Name string `json:"name"`
	WSN  WSN    `json:"wsn"`
}

type AccessDevices struct {
	ParentID   uint                   `json:"parent_id"`
	Devices    []uint                 `json:"devices"`
	IsNew      bool                   `json:"is_new"`
	DeviceType uint                   `json:"device_type"`
	Name       string                 `json:"name"`
	MacAddress string                 `json:"mac_address"`
	Sensors    map[string]interface{} `json:"sensors"`
	System     map[string]interface{} `json:"system"`
	IPN        map[string]interface{} `json:"ipn"`
}

type RemoveDevices struct {
	DeviceIDs []uint `json:"device_ids"`
}

type ImportNetwork struct {
	AssetID                 uint        `json:"asset_id"`
	CommunicationPeriod     uint        `json:"communication_period"`
	CommunicationTimeOffset uint        `json:"communication_time_offset"`
	GroupSize               uint        `json:"group_size"`
	GroupInterval           uint        `json:"group_interval"`
	RoutingTables           [][2]string `json:"routing_tables"`
	Devices                 []struct {
		Name       string                 `json:"name"`
		MacAddress string                 `json:"mac_address"`
		TypeID     uint                   `json:"type_id"`
		IPN        map[string]interface{} `json:"ipn,omitempty"`
		System     map[string]interface{} `json:"system,omitempty"`
		Sensors    map[string]interface{} `json:"sensors,omitempty"`
	} `json:"devices"`
}

type CreateNetwork struct {
	AssetID uint   `json:"asset_id"`
	Name    string `json:"name"`
	WSN     WSN    `json:"wsn"`
	Gateway struct {
		MacAddress string `json:"mac_address"`
	}
	IPN map[string]interface{} `json:"ipn"`
}
