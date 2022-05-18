package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type MonitoringPointAlertStateRepository interface {
	Create(mpId uint, e entity.MonitoringPointAlertState) error
	Get(mpId uint, id uint) (entity.MonitoringPointAlertState, error)
	Find(mpId uint) ([]entity.MonitoringPointAlertState, error)
	Delete(mpId uint, id uint) error
	DeleteAll(mpId uint) error
}
