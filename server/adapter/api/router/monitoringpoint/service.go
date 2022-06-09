package monitoringpoint

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateMonitoringPoint(req request.CreateMonitoringPoint) (vo.MonitoringPoint, error)
	GetMonitoringPointByID(id uint) (*vo.MonitoringPoint, error)
	UpdateMonitoringPointByID(id uint, req request.UpdateMonitoringPoint) error
	DeleteMonitoringPointByID(id uint) error
	BindDevice(id uint, req request.BindDevice) error
	UnbindDevice(id uint, req request.UnbindDevice) error

	FindMonitoringPointsByPaginate(page, size int, filters request.Filters) ([]vo.MonitoringPoint, int64, error)
	FindMonitoringPoints(filters request.Filters) ([]vo.MonitoringPoint, error)
	FindMonitoringPointRawDataByID(id uint, from, to int64) ([]vo.MonitoringPointData, error)
	FindMonitoringPointDataByID(id uint, from, to int64) ([]vo.MonitoringPointData, error)
	GetMonitoringPointDataByIDAndTimestamp(id uint, category uint, timestamp int64, filters request.Filters) (*vo.MonitoringPointData, error)
}
