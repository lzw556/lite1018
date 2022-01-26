package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AssetFilterQuery struct {
	po.Assets
}

func NewAssetFilterQuery() AssetFilterQuery {
	return AssetFilterQuery{}
}

func (query AssetFilterQuery) Run() []vo.Asset {
	result := make([]vo.Asset, len(query.Assets))
	for i, e := range query.Assets {
		result[i] = vo.NewAsset(e)
	}
	return result
}
