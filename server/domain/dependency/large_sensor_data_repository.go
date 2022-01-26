package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type LargeSensorDataRepository interface {
	Create(e *entity.LargeSensorData) error
	Find(mac string, from, to time.Time) ([]entity.LargeSensorData, error)
	Get(mac string, time time.Time) (entity.LargeSensorData, error)
}
