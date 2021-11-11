package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DevicePagingQuery struct {
	entity.Devices
	total         int64
	PropertiesMap map[uint][]po.Property

	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceAlertStatusRepo dependency.DeviceAlertStatusRepository
}

func NewDevicePagingQuery(total int64) DevicePagingQuery {
	return DevicePagingQuery{
		total:                 total,
		deviceStatusRepo:      repository.DeviceStatus{},
		deviceAlertStatusRepo: repository.DeviceAlertStatus{},
	}
}

func (query DevicePagingQuery) Paging() ([]vo.Device, int64) {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		result[i].SetProperties(query.PropertiesMap[device.TypeID])
		result[i].SetUpgradeState(device)
		result[i].State.DeviceStatus, _ = query.deviceStatusRepo.Get(device.ID)
		result[i].AlertState.DeviceAlertStatus, _ = query.deviceAlertStatusRepo.Get(device.ID)
	}
	return result, query.total
}
