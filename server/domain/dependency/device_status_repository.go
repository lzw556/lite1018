package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type DeviceStateRepository interface {
	Create(mac string, e entity.DeviceStatus) error
	Get(mac string) (entity.DeviceStatus, error)
	Find(mac string, from, to time.Time) ([]entity.DeviceStatus, error)
	Delete(mac string) error
}
