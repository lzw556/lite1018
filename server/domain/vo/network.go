package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type Network struct {
	ID                      uint             `json:"id"`
	Name                    string           `json:"name"`
	Gateway                 Device           `json:"gateway,omitempty"`
	Asset                   Asset            `json:"asset,omitempty"`
	Nodes                   []Device         `json:"nodes"`
	RoutingTables           po.RoutingTables `json:"routingTables"`
	CommunicationPeriod     uint             `json:"communicationPeriod"`
	CommunicationTimeOffset uint             `json:"communicationTimeOffset"`
	GroupSize               uint             `json:"groupSize"`
	GroupInterval           uint             `json:"groupInterval"`
}

func NewNetwork(e entity.Network) Network {
	return Network{
		ID:                      e.ID,
		Name:                    e.Name,
		CommunicationPeriod:     e.CommunicationPeriod,
		CommunicationTimeOffset: e.CommunicationTimeOffset,
		GroupSize:               e.GroupSize,
		GroupInterval:           e.GroupInterval,
		RoutingTables:           e.RoutingTables,
	}
}

func (n *Network) AddGateway(e entity.Device) {
	n.Gateway = NewDevice(e)
}

func (n *Network) SetNodes(nodes []Device) {
	n.Nodes = nodes
}

func (n *Network) AddAsset(e po.Asset) {
	n.Asset = NewAsset(e)
}
