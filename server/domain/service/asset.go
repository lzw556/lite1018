package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Asset struct {
	repository dependency.AssetRepository
}

func NewAsset() asset.Service {
	return Asset{
		repository: repository.Asset{},
	}
}

func (s Asset) CreateAsset(req request.Asset) error {
	e := po.Asset{
		Name: req.Name,
	}
	return s.repository.Create(context.TODO(), &e)
}

func (s Asset) UpdateAsset(assetID uint, req request.Asset) (*vo.Asset, error) {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, assetID)
	if err != nil {
		return nil, response.BusinessErr(response.AssetNotFoundError, "")
	}
	e.Name = req.Name
	if err := s.repository.Save(ctx, &e); err != nil {
		return nil, err
	}
	result := vo.NewAsset(e)
	return &result, nil
}

func (s Asset) RemoveAsset(assetID uint) error {
	return s.repository.Delete(context.TODO(), assetID)
}

func (s Asset) FindAssetsByPaginate(page, size int) ([]vo.Asset, int64, error) {
	es, total, err := s.repository.FindByPaginate(context.TODO(), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Asset, len(es))
	for i, e := range es {
		result[i] = vo.NewAsset(e)
	}
	return result, total, nil
}

func (s Asset) GetAsset(assetID uint) (*vo.Asset, error) {
	e, err := s.repository.Get(context.TODO(), assetID)
	if err != nil {
		return nil, response.BusinessErr(response.AssetNotFoundError, "")
	}
	result := vo.NewAsset(e)
	return &result, nil
}
