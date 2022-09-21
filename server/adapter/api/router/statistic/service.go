package statistic

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	GetDeviceStatistics(filters request.Filters) ([]vo.DeviceStatistic, error)
	GetAlertStatistics(filters request.Filters) ([]vo.AlertStatistic, error)
	GetAllStatistics(filters request.Filters) (vo.AllStatistics, error)
}
