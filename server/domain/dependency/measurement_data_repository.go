package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type MeasurementDataRepository interface {
	Create(e entity.MeasurementData) error
	Last(id uint) (entity.MeasurementData, error)
	FindAll(id uint) ([]entity.MeasurementData, error)
	Find(id uint, from, to time.Time) ([]entity.MeasurementData, error)
	Delete(id uint, from, to time.Time) error
}
