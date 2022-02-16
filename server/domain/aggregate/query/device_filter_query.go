package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceFilterQuery struct {
	entity.Devices

	deviceStatusRepo dependency.DeviceStateRepository
}

func NewDeviceFilterQuery() DeviceFilterQuery {
	return DeviceFilterQuery{
		deviceStatusRepo: repository.DeviceState{},
	}
}

func (query DeviceFilterQuery) Run() []vo.Device {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		result[i].SetUpgradeState(device)
		result[i].State, _ = query.deviceStatusRepo.Get(device.MacAddress)
	}
	return result
}
