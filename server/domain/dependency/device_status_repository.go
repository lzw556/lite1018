package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type DeviceStatusRepository interface {
	Create(id uint, e po.DeviceStatus) error
	Get(id uint) (po.DeviceStatus, error)
}
