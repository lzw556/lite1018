package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceFilterQuery struct {
	entity.Devices

	deviceDataRepo dependency.SensorDataRepository
}

func NewDeviceFilterQuery() DeviceFilterQuery {
	return DeviceFilterQuery{
		deviceDataRepo: repository.SensorData{},
	}
}

func (query DeviceFilterQuery) Run() []vo.Device {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		if data, err := query.deviceDataRepo.Last(device.MacAddress); err == nil {
			result[i].SetData(data)
		}
	}
	return result
}
