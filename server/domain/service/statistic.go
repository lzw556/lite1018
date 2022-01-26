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
	return Statistic{
		factory: factory.NewStatistic(),
	}
}

func (s Statistic) StatisticalMeasurements(filters request.Filters) ([]vo.MeasurementStatistic, error) {
	query, err := s.factory.NewStatisticalMeasurementsQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Statistic) StatisticalMeasurementDataByID(id uint) (*vo.MeasurementDataStatistic, error) {
	query, err := s.factory.NewStatisticalMeasurementDataQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Statistic) StatisticalMeasurementAlertByID(id uint) (*vo.MeasurementAlertStatistic, error) {
	query, err := s.factory.NewStatisticalMeasurementAlertQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Statistic) StatisticalDevices(filters request.Filters) ([]vo.DeviceStatistic, error) {
	query, err := s.factory.NewStatisticalDevicesQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Statistic) StatisticalAlarmRecords(from, to int64, filters request.Filters) (*vo.AlarmRecordStatistics, error) {
	query, err := s.factory.NewStatisticalAlarmRecordsQuery(from, to, filters)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}
