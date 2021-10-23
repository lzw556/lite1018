package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DeviceChildrenQuery struct {
	entity.Devices

	propertyRepo   dependency.PropertyRepository
	deviceDataRepo dependency.DeviceDataRepository
}

func NewDeviceChildrenQuery() DeviceChildrenQuery {
	return DeviceChildrenQuery{
		propertyRepo:   repository.Property{},
		deviceDataRepo: repository.DeviceData{},
	}
}

func (query DeviceChildrenQuery) Query() ([]vo.Device, error) {
	ctx := context.TODO()
	result := make([]vo.Device, len(query.Devices))
	propertiesMap := map[uint][]po.Property{}
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		if _, ok := propertiesMap[device.TypeID]; !ok {
			properties, err := query.propertyRepo.FindByDeviceTypeID(ctx, device.TypeID)
			if err != nil {
				return nil, err
			}
			propertiesMap[device.TypeID] = properties
		}
		result[i].SetProperties(propertiesMap[device.TypeID])
	}
	return result, nil
}
