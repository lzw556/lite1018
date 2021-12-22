package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type DeviceDataRepository interface {
	Create(e po.DeviceData) error
	Find(mac string, from, to time.Time) ([]po.DeviceData, error)
	Get(mac string, time time.Time) (po.DeviceData, error)
	Last(mac string) (po.DeviceData, error)
	Top(mac string, limit int) ([]po.DeviceData, error)
	Delete(mac string, from, to time.Time) error
}
