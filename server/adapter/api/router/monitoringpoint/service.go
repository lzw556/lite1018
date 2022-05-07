package monitoringpoint

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
)

type Service interface {
	CreateMonitoringPoint(req request.CreateMonitoringPoint) error
}
