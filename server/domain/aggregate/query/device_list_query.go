package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceListQuery struct {
	entity.Devices

	deviceDataRepo dependency.DeviceDataRepository
}

func NewDeviceListQuery() DeviceListQuery {
	return DeviceListQuery{
		deviceDataRepo: repository.DeviceData{},
	}
}

func (query DeviceListQuery) Run() []vo.Device {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		if data, err := query.deviceDataRepo.Last(device.MacAddress); err == nil {
			result[i].SetData(data)
		}
	}
	return result
}
