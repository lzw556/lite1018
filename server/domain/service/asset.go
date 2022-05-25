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
	return query.List()
}

func (s Asset) iterCalcMonitoringPointNum(asset vo.Asset) uint {
	var total uint = 0

	if asset.MonitoringPoints != nil {
		total += uint(len(asset.MonitoringPoints))
	}

	if asset.Children != nil {
		for _, c := range asset.Children {
			total += s.iterCalcMonitoringPointNum(*c)
		}
	}

	return total
}

func (s Asset) GetStatistics(id uint) (vo.AssetStatistics, error) {
	result := vo.NewAssetStatistics(id)

	asset, err := s.GetAssetByID(id)
	if err != nil {
		return result, err
	}

	result.MonitoringPointNum = s.iterCalcMonitoringPointNum(*asset)

	return result, nil
}
