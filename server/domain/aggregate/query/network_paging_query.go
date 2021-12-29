package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type NetworkPagingQuery struct {
	entity.Networks
	total int64
}

func NewNetworkPagingQuery(total int64) NetworkPagingQuery {
	return NetworkPagingQuery{
		total: total,
	}
}

func (query NetworkPagingQuery) Paging() ([]vo.Network, int64) {
	result := make([]vo.Network, len(query.Networks))
	for i, network := range query.Networks {
		result[i] = vo.NewNetwork(network)
		result[i].Gateway.ID = network.GatewayID
	}
	return result, query.total
}
