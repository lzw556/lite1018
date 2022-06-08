package service

import (
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/monitoringpoint"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type MonitoringPoint struct {
	repository dependency.MonitoringPointRepository
	factory    factory.MonitoringPoint
}

func NewMonitoringPoint() monitoringpoint.Service {
	return MonitoringPoint{
		repository: repository.MonitoringPoint{},
		factory:    factory.NewMonitoringPoint(),
	}
}

func (s MonitoringPoint) CreateMonitoringPoint(req request.CreateMonitoringPoint) (vo.MonitoringPoint, error) {
	cmd, err := s.factory.NewMonitoringPointCreateCmd(req)
	if err != nil {
		return vo.MonitoringPoint{}, err
	}

	e, err := cmd.Run()
	if err != nil {
		return vo.MonitoringPoint{}, err
	}

	return vo.NewMonitoringPoint(e), nil
}

func (s MonitoringPoint) GetMonitoringPointByID(id uint) (*vo.MonitoringPoint, error) {
	query := s.factory.NewMonitoringPointQuery(nil)
	mp, err := query.Get(id)
	return &mp, err
}

func (s MonitoringPoint) UpdateMonitoringPointByID(id uint, req request.UpdateMonitoringPoint) error {
	cmd, err := s.factory.NewMonitoringPointUpdateCmd(id, req)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s MonitoringPoint) DeleteMonitoringPointByID(id uint) error {
	cmd, err := s.factory.NewMonitoringPointRemoveCmd(id)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s MonitoringPoint) BindDevice(id uint, req request.BindDevice) error {
	cmd, err := s.factory.NewMonitoringPointBindDeviceCmd(id)
	if err != nil {
		return err
	}

	return cmd.BindDevice(req)
}

func (s MonitoringPoint) UnbindDevice(id uint, req request.UnbindDevice) error {
	cmd, err := s.factory.NewMonitoringPointBindDeviceCmd(id)
	if err != nil {
		return err
	}

	return cmd.UnbindDevice(req)
}

func (s MonitoringPoint) FindMonitoringPointsByPaginate(page, size int, filters request.Filters) ([]vo.MonitoringPoint, int64, error) {
	query := s.factory.NewMonitoringPointQuery(filters)
	return query.Paging(page, size)
}

func (s MonitoringPoint) FindMonitoringPoints(filters request.Filters) ([]vo.MonitoringPoint, error) {
	query := s.factory.NewMonitoringPointQuery(filters)
	return query.List()
}

func (s MonitoringPoint) FindMonitoringPointDataByID(id uint, from, to int64) ([]vo.MonitoringPointData, error) {
	query := s.factory.NewMonitoringPointQuery(nil)
	return query.FindMonitoringPointDataByID(id, time.Unix(from, 0), time.Unix(to, 0))
}

func (s MonitoringPoint) FindMonitoringPointRawDataByID(id uint, from, to int64) ([]vo.MonitoringPointData, error) {
	query := s.factory.NewMonitoringPointQuery(nil)
	return query.FindMonitoringPointRawDataByID(id, time.Unix(from, 0), time.Unix(to, 0))
}
