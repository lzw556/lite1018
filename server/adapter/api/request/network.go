package request

type WSN struct {
	CommunicationPeriod     uint `json:"communication_period"`
	CommunicationTimeOffset uint `json:"communication_time_offset"`
	GroupSize               uint `json:"group_size"`
	GroupInterval           uint `json:"group_interval"`
}

type Network struct {
	Name string `json:"name"`
	WSN
}

type AccessDevices struct {
	Parent   uint   `json:"parent"`
	Children []uint `json:"children"`
}

type RemoveDevices struct {
	DeviceIDs     []uint      `json:"device_ids"`
	RoutingTables [][2]string `json:"routing_tables"`
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
