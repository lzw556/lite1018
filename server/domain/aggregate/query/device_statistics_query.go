package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceStatisticsQuery struct {
	entity.Devices

	deviceStatusRepo dependency.DeviceStatusRepository
}

func NewDeviceStatisticsQuery() DeviceStatisticsQuery {
	return DeviceStatisticsQuery{
		deviceStatusRepo: repository.DeviceStatus{},
	}
}

func (query DeviceStatisticsQuery) Run() ([]vo.DeviceStatistic, error) {
	result := make([]vo.DeviceStatistic, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDeviceStatistic(device)
	}
	return result, nil
}
