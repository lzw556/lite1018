package alarm

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAlarmRule(req request.AlarmRule) error
	FindAlarmRuleByPaginate(page, size int, filters request.Filters) ([]vo.AlarmRule, int64, error)
	GetAlarmRuleByID(id uint) (*vo.AlarmRule, error)
}
