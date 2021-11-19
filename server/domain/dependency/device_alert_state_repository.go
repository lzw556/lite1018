package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceAlertStateRepository interface {
	Create(id uint, e *entity.DeviceAlertState) error
	Save(id uint, e *entity.DeviceAlertState) error
	Get(id uint) (entity.DeviceAlertState, error)
	Delete(id uint) error
}
