package dependency

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDataRepository interface {
	Create(e entity.MonitoringPointData) error
}
