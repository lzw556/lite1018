package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type DeviceInformationRepository interface {
	Create(id uint, e po.DeviceInformation) error
	Get(id uint) (po.DeviceInformation, error)
}
