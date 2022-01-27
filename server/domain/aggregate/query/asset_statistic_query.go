package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AssetStatisticQuery struct {
	po.Asset
	Devices entity.Devices

	deviceStatusRepo dependency.DeviceStatusRepository
	deviceDataRepo   dependency.SensorDataRepository
}

func NewAssetStatisticQuery() AssetStatisticQuery {
	return AssetStatisticQuery{
		deviceDataRepo:   repository.SensorData{},
		deviceStatusRepo: repository.DeviceStatus{},
	}
}

func (query AssetStatisticQuery) Statistic() (*vo.AssetStatistic, error) {
	var err error
	result := vo.NewAssetStatistic(query.Asset)
	result.Devices, err = query.buildDevices(query.Devices)
	result.UpdateStatus()
	return &result, err
}

func (query AssetStatisticQuery) buildDevices(devices []entity.Device) ([]vo.Device, error) {
	result := make([]vo.Device, len(devices))
	for i, device := range devices {
		result[i] = vo.NewDevice(device)
		if status, err := query.deviceStatusRepo.Get(device.MacAddress); err == nil {
			result[i].State.DeviceStatus = status
		}
	}
	return result, nil
}
