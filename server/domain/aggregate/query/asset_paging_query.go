package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AssetPagingQuery struct {
	po.Assets

	total int64
}

func NewAssetPagingQuery(total int64) AssetPagingQuery {
	return AssetPagingQuery{
		total: total,
	}
}

func (query AssetPagingQuery) Run() ([]vo.Asset, int64) {
	result := make([]vo.Asset, len(query.Assets))
	for i, e := range query.Assets {
		result[i] = vo.NewAsset(e)
	}
	return result, query.total
}
