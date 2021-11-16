package alarm

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAlarmRuleTemplate(req request.AlarmRuleTemplate) error
	FindAlarmRuleTemplatesByPaginate(page, size int, deviceType uint) ([]vo.AlarmRuleTemplate, int64, error)
	GetAlarmRuleTemplate(id uint) (*vo.AlarmRuleTemplate, error)
	UpdateAlarmRuleTemplate(id uint, req request.AlarmRuleTemplate) (*vo.AlarmRuleTemplate, error)
	RemoveAlarmRuleTemplate(id uint) error

	CheckAlarmRule(name string) error
	CreateAlarmRule(req request.AlarmRule) error
	FindAlarmRulesByPaginate(assetID, deviceID uint, page, size int) ([]vo.AlarmRule, int64, error)
	GetAlarmRule(id uint) (*vo.AlarmRule, error)
	UpdateAlarmRule(id uint, req request.UpdateAlarmRule) error
	RemoveAlarmRule(id uint) error

	GetAlarmRecord(recordID uint) (*vo.AlarmRecord, error)
	FindAlarmRecordsByPaginate(from, to int64, page, size int, req request.AlarmFilter) ([]vo.AlarmRecord, int64, error)
	RemoveAlarmRecord(recordID uint) error

	GetAlarmStatistics(from, to int64, req request.AlarmFilter) (vo.AlarmStatistics, error)
}
