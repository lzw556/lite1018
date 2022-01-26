package statistic

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	StatisticalMeasurements(filters request.Filters) ([]vo.MeasurementStatistic, error)
	StatisticalMeasurementDataByID(id uint) (*vo.MeasurementDataStatistic, error)
	StatisticalMeasurementAlertByID(id uint) (*vo.MeasurementAlertStatistic, error)
	StatisticalDevices(filters request.Filters) ([]vo.DeviceStatistic, error)
	StatisticalAlarmRecords(from, to int64, filters request.Filters) (*vo.AlarmRecordStatistics, error)
}
