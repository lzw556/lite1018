package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type MeasurementDataRepository interface {
	Create(e po.MeasurementData) error
	Last(id uint) (po.MeasurementData, error)
	FindAll(id uint) ([]po.MeasurementData, error)
	Find(id uint, from, to time.Time) ([]po.MeasurementData, error)
}
