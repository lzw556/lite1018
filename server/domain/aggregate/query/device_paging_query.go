package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type DevicePagingQuery struct {
	entity.Devices
	total int64

	deviceStatusRepo dependency.DeviceStatusRepository
	alarmRecordRepo  dependency.AlarmRecordRepository
}

func NewDevicePagingQuery(total int64) DevicePagingQuery {
	return DevicePagingQuery{
		total:            total,
		deviceStatusRepo: repository.DeviceStatus{},
		alarmRecordRepo:  repository.AlarmRecord{},
	}
}

func (query DevicePagingQuery) Paging() ([]vo.Device, int64) {
	result := make([]vo.Device, len(query.Devices))
	for i, device := range query.Devices {
		result[i] = vo.NewDevice(device)
		result[i].SetUpgradeState(device)
		result[i].State.DeviceStatus, _ = query.deviceStatusRepo.Get(device.MacAddress)
	}
	return result, query.total
}
