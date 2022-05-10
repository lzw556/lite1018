package asset

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAsset(req request.CreateAsset) error
	GetAssetByID(id uint) (*vo.Asset, error)
	UpdateAssetByID(id uint, req request.UpdateAsset) error
	DeleteAssetByID(id uint) error
}
