package dependency

import (
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDataRepository interface {
	Create(e entity.MonitoringPointData) error
	Find(id uint, from, to time.Time) ([]entity.MonitoringPointData, error)
	Get(mpId uint, time time.Time) (entity.MonitoringPointData, error)
	Last(mpId uint) (entity.MonitoringPointData, error)
	Top(mpId uint, limit int) ([]entity.MonitoringPointData, error)
	Delete(mpId uint, from, to time.Time) error
	FindTimes(mpId uint, from, to time.Time) ([]time.Time, error)
}
