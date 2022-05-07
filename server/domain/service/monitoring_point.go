package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/monitoringpoint"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
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

func (s MonitoringPoint) CreateMonitoringPoint(req request.CreateMonitoringPoint) error {
	cmd, err := s.factory.NewMonitoringPointCreateCmd(req)
	if err != nil {
		return err
	}

	return cmd.Run()
}
