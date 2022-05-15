package dependency

import (
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDataRepository interface {
	Create(e entity.MonitoringPointData) error
	Find(id uint, from, to time.Time) ([]entity.MonitoringPointData, error)
}
