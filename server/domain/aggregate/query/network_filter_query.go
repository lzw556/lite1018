package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type NetworkFilterQuery struct {
	entity.Networks
}

func NewNetworkFilterQuery() NetworkFilterQuery {
	return NetworkFilterQuery{}
}

func (query NetworkFilterQuery) Run() ([]vo.Network, error) {
	result := make([]vo.Network, len(query.Networks))
	for i, network := range query.Networks {
		result[i] = vo.NewNetwork(network)
	}
	return result, nil
}
