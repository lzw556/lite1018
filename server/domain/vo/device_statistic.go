package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceStatistic struct {
	Device Device `json:"device"`
	Status uint   `json:"status"`
}

func NewDeviceStatistic(e entity.Device) DeviceStatistic {
	s := DeviceStatistic{
		Device: NewDevice(e),
	}
	if e.GetConnectionState().IsOnline {
		s.Status = 1
	} else {
		s.Status = 0
	}
	return s
}
