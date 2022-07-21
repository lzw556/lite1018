package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Network struct {
	ID                   uint                 `json:"id"`
	Name                 string               `json:"name"`
	Gateway              Device               `json:"gateway,omitempty"`
	Nodes                []Device             `json:"nodes"`
	RoutingTables        entity.RoutingTables `json:"routingTables"`
	CommunicationPeriod  uint                 `json:"communicationPeriod"`
	CommunicationPeriod2 uint                 `json:"communicationPeriod2"`
	CommunicationOffset  uint                 `json:"communicationOffset"`
	GroupSize            uint                 `json:"groupSize"`
	Mode                 uint8                `json:"mode"`
}

func NewNetwork(e entity.Network) Network {
	return Network{
		ID:                   e.ID,
		Name:                 e.Name,
		CommunicationPeriod:  e.CommunicationPeriod,
		CommunicationPeriod2: e.CommunicationPeriod2,
		CommunicationOffset:  e.CommunicationTimeOffset,
		GroupSize:            e.GroupSize,
		Mode:                 uint8(e.Mode),
	}
}

func (n *Network) AddGateway(e entity.Device) {
	n.Gateway = NewDevice(e)
}

func (n *Network) SetNodes(nodes []Device) {
	n.Nodes = nodes
}
