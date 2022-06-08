package dependency

import (
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDataRepository interface {
	Create(e entity.MonitoringPointData) error
	Find(id uint, category uint, from, to time.Time) ([]entity.MonitoringPointData, error)
	Get(mpId uint, category uint, time time.Time) (entity.MonitoringPointData, error)
	Last(mpId uint, category uint) (entity.MonitoringPointData, error)
	Top(mpId uint, category uint, limit int) ([]entity.MonitoringPointData, error)
	Delete(mpId uint, category uint, from, to time.Time) error
	FindTimes(mpId uint, category uint, from, to time.Time) ([]time.Time, error)
}
