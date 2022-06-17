package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type AssetQuery struct {
	Specs []spec.Specification

	assetRepo           dependency.AssetRepository
	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewAssetQuery() AssetQuery {
	return AssetQuery{
		assetRepo:           repository.Asset{},
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (query AssetQuery) newAsset(asset entity.Asset) vo.Asset {
	return vo.NewAsset(asset)
}

func (query AssetQuery) iterCalcStatistics(asset vo.Asset, result *vo.AssetStatistics) error {
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
			err := query.iterCalcStatistics(*c, result)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (query AssetQuery) getStatistics(asset vo.Asset) (vo.AssetStatistics, error) {
	result := vo.NewAssetStatistics(asset.ID)

	err := query.iterCalcStatistics(asset, &result)

	return result, err
}

func (query AssetQuery) iterAppendStatistics(asset *vo.Asset) error {
	stat, err := query.getStatistics(*asset)
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
			err := query.iterAppendStatistics(child)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (query AssetQuery) Get(assetId uint) (vo.Asset, error) {
	e, err := query.assetRepo.Get(context.TODO(), assetId)
	if err != nil {
		return vo.Asset{}, err
	}

	voAsset := query.newAsset(e)
	query.iterSetChildren(&voAsset)
	if err := query.iterAppendStatistics(&voAsset); err != nil {
		return voAsset, err
	}

	return voAsset, nil
}

func (query AssetQuery) Paging(page, size int) ([]vo.Asset, int64, error) {
	ctx := context.TODO()
	es, total, err := query.assetRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	sort.Sort(es)
	result := make([]vo.Asset, len(es))
	for i, asset := range es {
		result[i] = query.newAsset(asset)
		query.iterSetChildren(&result[i])
	}
	return result, total, nil
}

func (query AssetQuery) iterSetChildren(asset *vo.Asset) {
	children := query.getChildren(asset.ID)
	asset.Children = children
	mps, err := query.monitoringPointRepo.FindBySpecs(context.TODO(), spec.AssetEqSpec(asset.ID))
	if err == nil {
		voMps := make([]*vo.MonitoringPoint, 0)
		mpQuery := NewMonitoringPointQuery()
		for _, mp := range mps {
			voMp, err := mpQuery.Get(mp.ID)
			if err == nil {
				voMps = append(voMps, &voMp)
			}
		}

		asset.MonitoringPoints = voMps
	}
	for _, c := range asset.Children {
		query.iterSetChildren(c)
	}
}

func (query AssetQuery) getChildren(assetId uint) []*vo.Asset {
	es, err := query.assetRepo.FindBySpecs(context.TODO(), spec.ParentIDEqSpec(assetId))

	result := make([]*vo.Asset, 0)

	if err != nil {
		return result
	}

	for _, e := range es {
		asset := query.newAsset(e)
		result = append(result, &asset)
	}

	return result
}

func (query AssetQuery) List() ([]vo.Asset, error) {
	ctx := context.TODO()
	es, err := query.assetRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return []vo.Asset{}, err
	}
	result := make([]vo.Asset, len(es))
	for i, asset := range es {
		result[i] = query.newAsset(asset)
		query.iterSetChildren(&result[i])
		if err := query.iterAppendStatistics(&result[i]); err != nil {
			return []vo.Asset{}, err
		}
	}
	return result, nil
}
