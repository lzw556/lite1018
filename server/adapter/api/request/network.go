package request

type WSN struct {
	CommunicationPeriod     uint `json:"communication_period"`
	CommunicationTimeOffset uint `json:"communication_time_offset"`
}

type AccessDevices struct {
	Parent   uint   `json:"parent"`
	Children []uint `json:"children"`
}

type ImportNetwork struct {
	AssetID                 uint        `json:"asset_id"`
	CommunicationPeriod     uint        `json:"communication_period"`
	CommunicationTimeOffset uint        `json:"communication_time_offset"`
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
