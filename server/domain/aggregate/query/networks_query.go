package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type NetworksQuery struct {
	entity.Networks
}

func NewNetworksQuery() NetworksQuery {
	return NetworksQuery{}
}

func (query NetworksQuery) List() []vo.Network {
	result := make([]vo.Network, len(query.Networks))
	for i, network := range query.Networks {
		result[i] = vo.NewNetwork(network)
	}
	return result
}
