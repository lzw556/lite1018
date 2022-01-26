package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceChildrenQuery struct {
	entity.Devices

	deviceDataRepo dependency.SensorDataRepository
}

func NewDeviceChildrenQuery() DeviceChildrenQuery {
	return DeviceChildrenQuery{
		deviceDataRepo: repository.SensorData{},
	}
}

func (query DeviceChildrenQuery) Query() ([]vo.Device, error) {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
	}
	return result, nil
}
