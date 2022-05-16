package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/statistic"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Statistic struct {
	factory factory.Statistic
}

func NewStatistic() statistic.Service {
	return &Statistic{
		factory: factory.NewStatistic(),
	}
}

func (s Statistic) GetDeviceStatistics(filters request.Filters) ([]vo.DeviceStatistic, error) {
	query := s.factory.NewStatisticQuery(filters)
	return query.GetDeviceStatistics()
}

func (s Statistic) GetAlertStatistics(filters request.Filters) ([]vo.AlertStatistic, error) {
	query := s.factory.NewStatisticQuery(filters)
	return query.GetAlertStatistics()
}
