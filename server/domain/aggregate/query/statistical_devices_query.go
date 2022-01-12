package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type StatisticalDevicesQuery struct {
	entity.Devices
}

func NewStatisticalDevicesQuery() StatisticalDevicesQuery {
	return StatisticalDevicesQuery{}
}

func (query StatisticalDevicesQuery) Run() []vo.DeviceStatistic {
	result := make([]vo.DeviceStatistic, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDeviceStatistic(device)
	}
	return result
}
