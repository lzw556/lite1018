package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type DeviceStatusRepository interface {
	Create(mac string, e po.DeviceStatus) error
	Get(mac string) (po.DeviceStatus, error)
	Find(mac string, from, to time.Time) ([]po.DeviceStatus, error)
	Delete(mac string) error
}
