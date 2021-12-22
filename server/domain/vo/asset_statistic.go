package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AssetStatistic struct {
	Asset   Asset    `json:"asset"`
	Devices []Device `json:"devices"`
	Status  uint     `json:"status"`
}

func NewAssetStatistic(e po.Asset) AssetStatistic {
	return AssetStatistic{
		Asset: NewAsset(e),
	}
}

func (s *AssetStatistic) UpdateStatus() {
}
