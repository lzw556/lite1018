package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceInformationRepository interface {
	Create(mac string, e entity.DeviceInformation) error
	Get(mac string) (entity.DeviceInformation, error)
	Delete(mac string) error
}
