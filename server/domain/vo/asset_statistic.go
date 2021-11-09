package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
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

func (s *AssetStatistic) SetStatus(devices []entity.Device) {
	for _, device := range devices {
		if device.GetAlertLevel() > s.Status {
			s.Status = device.GetAlertLevel()
		}
		if s.Status >= 3 {
			break
		}
	}
}
