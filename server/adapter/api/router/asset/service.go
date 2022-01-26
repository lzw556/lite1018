package asset

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAsset(req request.Asset) error
	UpdateAssetByID(id uint, req request.Asset) error
	DeleteAssetByID(id uint) error
	FindAssetsByPaginate(page, size int, filters request.Filters) ([]vo.Asset, int64, error)
	FilterAssets(filters request.Filters) ([]vo.Asset, error)
	GetAssetChildrenByID(id uint) ([]vo.Asset, error)
	GetAssetByID(id uint) (*vo.Asset, error)
	StatisticalAssetByID(id uint) (*vo.AssetStatistic, error)
	StatisticalAssets() ([]vo.AssetStatistic, error)
}
