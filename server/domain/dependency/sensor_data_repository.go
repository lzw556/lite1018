package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type SensorDataRepository interface {
	Create(e entity.SensorData) error
	Find(mac string, from, to time.Time) ([]entity.SensorData, error)
	Get(mac string, time time.Time) (entity.SensorData, error)
	Last(mac string) (entity.SensorData, error)
	Top(mac string, limit int) ([]entity.SensorData, error)
	Delete(mac string, from, to time.Time) error
}
