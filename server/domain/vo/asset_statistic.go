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
	for _, device := range s.Devices {
		if uint(device.State.AlertLevel) > s.Status {
			s.Status = uint(device.State.AlertLevel)
		}
		if s.Status >= 3 {
			break
		}
	}
}
