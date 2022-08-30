package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
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

func (s Asset) CreateAsset(req request.CreateAsset) error {
	cmd, err := s.factory.NewAssetCreateCmd(req)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s Asset) GetAssetByID(id uint) (*vo.Asset, error) {
	query := s.factory.NewAssetQuery(nil)
	voAsset, err := query.Get(id)

	return &voAsset, err
}

func (s Asset) UpdateAssetByID(id uint, req request.UpdateAsset) error {
	cmd, err := s.factory.NewAssetUpdateCmd(id, req)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s Asset) DeleteAssetByID(id uint) error {
	cmd, err := s.factory.NewAssetRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Asset) FindAssetsByPaginate(page, size int, filters request.Filters) ([]vo.Asset, int64, error) {
	query := s.factory.NewAssetQuery(filters)
	return query.Paging(page, size)
}

func (s Asset) FindAssets(filters request.Filters) ([]vo.Asset, error) {
	query := s.factory.NewAssetQuery(filters)
	result, err := query.List()

	return result, err
}

func (s Asset) GetStatistics(id uint) (vo.AssetStatistics, error) {
	query := s.factory.NewAssetQuery(nil)
	asset, err := query.Get(id)

	return asset.Statistics, err
}
