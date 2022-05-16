package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type DeviceAlertStateRepository interface {
	Create(mac string, e entity.DeviceAlertState) error
	Get(mac string, id uint) (entity.DeviceAlertState, error)
	Find(mac string) ([]entity.DeviceAlertState, error)
	Delete(mac string, id uint) error
	DeleteAll(mac string) error
}
