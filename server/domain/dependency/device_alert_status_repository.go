package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type DeviceAlertStatusRepository interface {
	Create(id uint, e *po.DeviceAlertStatus) error
	Get(id uint) (po.DeviceAlertStatus, error)
	Delete(id uint) error
}
