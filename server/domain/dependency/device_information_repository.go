package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceInformationRepository interface {
	Create(id uint, e entity.DeviceInformation) error
	Get(id uint) (entity.DeviceInformation, error)
	Delete(id uint) error
}
