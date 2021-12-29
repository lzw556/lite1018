package asset

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAsset(req request.Asset) error
	UpdateAsset(assetID uint, req request.Asset) (*vo.Asset, error)
	RemoveAsset(assetID uint) error
	FindAssetsByPaginate(page, size int) ([]vo.Asset, int64, error)
	FindAssets() ([]vo.Asset, error)
	GetAssetChildren(id uint) ([]vo.Asset, error)
	GetAsset(assetID uint) (*vo.Asset, error)
	Statistic(assetID uint) (*vo.AssetStatistic, error)
	StatisticAll() ([]vo.AssetStatistic, error)
}
