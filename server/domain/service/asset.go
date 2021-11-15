package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type Asset struct {
	repository dependency.AssetRepository
	factory    factory.Asset
}

func NewAsset() asset.Service {
	return Asset{
		repository: repository.Asset{},
		factory:    factory.NewAsset(),
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
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
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
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
	}
	result := vo.NewAsset(e)
	return &result, nil
}

func (s Asset) Statistic(assetID uint) (*vo.AssetStatistic, error) {
	cmd, err := s.factory.NewAssetStatisticQuery(assetID)
	if err != nil {
		return nil, err
	}
	return cmd.Statistic()
}

func (s Asset) StatisticAll() ([]vo.AssetStatistic, error) {
	assets, err := s.repository.Find(context.TODO())
	if err != nil {
		return nil, err
	}
	result := make([]vo.AssetStatistic, len(assets))
	for i, e := range assets {
		cmd, err := s.factory.NewAssetStatisticQuery(e.ID)
		if err != nil {
			return nil, err
		}
		statistic, err := cmd.Statistic()
		if err != nil {
			return nil, err
		}
		result[i] = *statistic
	}
	return result, nil
}
