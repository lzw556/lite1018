package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceGroupByQuery struct {
	entity.Devices

	assetRepo dependency.AssetRepository
}

func NewDeviceGroupByQuery() DeviceGroupByQuery {
	return DeviceGroupByQuery{
		assetRepo: repository.Asset{},
	}
}

func (query DeviceGroupByQuery) GroupBy(by string) ([]vo.Group, error) {
	groups := make([]vo.Group, 0)
	if by == "asset" {
		result := make(map[uint][]vo.Device, 0)
		for _, device := range query.Devices {
			if _, ok := result[device.AssetID]; !ok {
				result[device.AssetID] = make([]vo.Device, 0)
			}
			result[device.AssetID] = append(result[device.AssetID], vo.NewDevice(device))
		}
		ctx := context.TODO()
		for assetID, devices := range result {
			asset, err := query.assetRepo.Get(ctx, assetID)
			if err != nil {
				return nil, err
			}
			group := vo.NewGroup(asset.ID, asset.Name)
			group.AddDevices(devices...)
			groups = append(groups, group)
		}
	}
	return groups, nil
}
