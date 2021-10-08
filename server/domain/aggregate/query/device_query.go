package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type DeviceQuery struct {
	entity.Device
	Network entity.Network

	deviceRepo       dependency.DeviceRepository
	deviceStatusRepo dependency.DeviceStatusRepository
	deviceDataRepo   dependency.DeviceDataRepository
	assetRepo        dependency.AssetRepository
	propertyRepo     dependency.PropertyRepository
}

func NewDeviceQuery() DeviceQuery {
	return DeviceQuery{
		deviceRepo:       repository.Device{},
		deviceStatusRepo: repository.DeviceStatus{},
		deviceDataRepo:   repository.DeviceData{},
		assetRepo:        repository.Asset{},
		propertyRepo:     repository.Property{},
	}
}

func (query DeviceQuery) Detail() (*vo.Device, error) {
	ctx := context.TODO()
	asset, err := query.assetRepo.Get(ctx, query.Device.AssetID)
	if err != nil {
		return nil, err
	}
	result := vo.NewDevice(query.Device)
	result.SetAsset(asset)
	result.Status.DeviceStatus, _ = query.deviceStatusRepo.Get(query.Device.ID)
	if query.Network.ID != 0 {
		result.SetWSN(query.Network)
	}
	return &result, nil
}

func (query DeviceQuery) Setting() *vo.DeviceSetting {
	result := vo.NewDeviceSetting(query.Device)
	if query.Network.ID != 0 {
		result.SetNetwork(query.Network)
	}
	return &result
}

func (query DeviceQuery) DataByRange(pid uint, from, to time.Time) (vo.PropertyData, error) {
	property, err := query.propertyRepo.Get(context.TODO(), pid)
	if err != nil {
		return vo.PropertyData{}, err
	}
	data, err := query.deviceDataRepo.Find(query.Device.ID, from, to)
	if err != nil {
		return vo.PropertyData{}, err
	}
	result := vo.NewPropertyData(property)
	for k := range property.Fields {
		result.Fields[k] = make([]float32, len(data))
	}
	result.Time = make([]int64, len(data))
	for i, d := range data {
		result.Time[i] = d.Time.UTC().Unix()
		for k, v := range property.Fields {
			result.Fields[k][i] = d.Values[v]
		}
	}
	return result, nil
}
