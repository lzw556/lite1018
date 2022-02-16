package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type DeviceStateRepository interface {
	Create(mac string, e entity.DeviceState) error
	Get(mac string) (entity.DeviceState, error)
	Find(mac string, from, to time.Time) ([]entity.DeviceState, error)
	Delete(mac string) error
}
