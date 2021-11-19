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

	deviceStatusRepo     dependency.DeviceStatusRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
	alarmRecordRepo      dependency.AlarmRecordRepository
}

func NewDevicePagingQuery(total int64) DevicePagingQuery {
	return DevicePagingQuery{
		total:                total,
		deviceStatusRepo:     repository.DeviceStatus{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
		alarmRecordRepo:      repository.AlarmRecord{},
	}
}

func (query DevicePagingQuery) Paging() ([]vo.Device, int64) {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		result[i].SetProperties(query.PropertiesMap[device.TypeID])
		result[i].SetUpgradeState(device)
		result[i].State.DeviceStatus, _ = query.deviceStatusRepo.Get(device.ID)
		if alertState, err := query.deviceAlertStateRepo.Get(device.ID); err == nil {
			result[i].AlertState = vo.NewDeviceAlertState(alertState)
		}
	}
	return result, query.total
}
