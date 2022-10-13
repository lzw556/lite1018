package openapivo

type Network struct {
	ID                   uint   `json:"id"`
	Name                 string `json:"name"`
	CommunicationPeriod  uint   `json:"communicationPeriod"`
	CommunicationPeriod2 uint   `json:"communicationPeriod2"`
	CommunicationOffset  uint   `json:"communicationOffset"`
	GroupSize            uint   `json:"groupSize"`
	Mode                 uint8  `json:"mode"`
}

type NetworkDetail struct {
	ID                   uint   `json:"id"`
	Name                 string `json:"name"`
	CommunicationPeriod  uint   `json:"communicationPeriod"`
	CommunicationPeriod2 uint   `json:"communicationPeriod2"`
	CommunicationOffset  uint   `json:"communicationOffset"`
	GroupSize            uint   `json:"groupSize"`
	Mode                 uint8  `json:"mode"`

	Gateway NetworkDevice   `json:"gateway,omitempty"`
	Nodes   []NetworkDevice `json:"nodes"`
}

type NetworkDevice struct {
	MacAddress string `json:"macAddress"`
	Parent     string `json:"parent"`
}
