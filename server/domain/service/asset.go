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
	if err != nil {
		return nil, err
	}

	err = s.iterAppendStatistics(&voAsset)

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
	if err != nil {
		return result, err
	}

	for i := range result {
		err := s.iterAppendStatistics(&result[i])
		if err != nil {
			return []vo.Asset{}, err
		}
	}

	return result, nil
}

func (s Asset) iterCalcStatistics(asset vo.Asset, result *vo.AssetStatistics) error {
	if asset.MonitoringPoints != nil && len(asset.MonitoringPoints) > 0 {
		result.MonitoringPointNum += uint(len(asset.MonitoringPoints))
		for _, mp := range asset.MonitoringPoints {
			switch mp.AlertLevel {
			case 1:
				result.AlarmNum[0]++
			case 2:
				result.AlarmNum[1]++
			case 3:
				result.AlarmNum[2]++
			}
			if mp.BindingDevices != nil && len(mp.BindingDevices) > 0 {
				result.DeviceNum += uint(len(mp.BindingDevices))
				for _, dev := range mp.BindingDevices {
					if !dev.State.IsOnline {
						result.OfflineDeviceNum += 1
					}
				}
			}
		}
	}

	if asset.Children != nil {
		for _, c := range asset.Children {
			err := s.iterCalcStatistics(*c, result)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (s Asset) GetStatistics(id uint) (vo.AssetStatistics, error) {
	result := vo.NewAssetStatistics(id)

	query := s.factory.NewAssetQuery(nil)
	asset, err := query.Get(id)

	if err != nil {
		return result, err
	}

	err = s.iterCalcStatistics(asset, &result)

	return result, err
}

func (s Asset) iterAppendStatistics(asset *vo.Asset) error {
	stat, err := s.GetStatistics(asset.ID)
	if err != nil {
		return err
	}

	asset.Statistics = stat

	if stat.AlarmNum[2] > 0 {
		asset.AlertLevel = 3
	} else if stat.AlarmNum[1] > 0 {
		asset.AlertLevel = 2
	} else if stat.AlarmNum[0] > 0 {
		asset.AlertLevel = 1
	} else {
		asset.AlertLevel = 0
	}

	if asset.Children != nil && len(asset.Children) > 0 {
		for _, child := range asset.Children {
			err := s.iterAppendStatistics(child)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
