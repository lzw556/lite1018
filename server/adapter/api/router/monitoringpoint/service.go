package monitoringpoint

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateMonitoringPoint(req request.CreateMonitoringPoint) error
	GetMonitoringPointByID(id uint) (*vo.MonitoringPoint, error)
	UpdateMonitoringPointByID(id uint, req request.UpdateMonitoringPoint) error
	DeleteMonitoringPointByID(id uint) error
}
