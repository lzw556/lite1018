package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceStatisticQuery struct {
	entity.Devices

	deviceStatusRepo dependency.DeviceStatusRepository
}

func NewDeviceStatisticQuery() DeviceStatisticQuery {
	return DeviceStatisticQuery{
		deviceStatusRepo: repository.DeviceStatus{},
	}
}

func (query DeviceStatisticQuery) Statistic() ([]vo.DeviceStatistic, error) {
	result := make([]vo.DeviceStatistic, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDeviceStatistic(device)
	}
	return result, nil
}
