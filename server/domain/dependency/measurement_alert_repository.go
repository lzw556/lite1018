package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type MeasurementAlertRepository interface {
	Create(e *entity.MeasurementAlert) error
	Get(id uint) (entity.MeasurementAlert, error)
}
