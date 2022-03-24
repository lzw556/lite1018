package alarm

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAlarmRule(req request.AlarmRule) error
	FindAlarmRuleByPaginate(page, size int, filters request.Filters) ([]vo.AlarmRule, int64, error)
	GetAlarmRuleByID(id uint) (*vo.AlarmRule, error)
	UpdateAlarmRuleByID(id uint, req request.AlarmRule) error
	UpdateAlarmRuleStatusByID(id uint, status uint8) error
	DeleteAlarmRuleByID(id uint) error
	CheckAlarmRuleName(name string) (bool, error)
	AddSourcesToAlarmRule(id uint, sources []uint) error
	RemoveSourcesFromAlarmRule(id uint, sources []uint) error

	FindAlarmRecordByPaginate(page, size int, from, to int64, filters request.Filters) ([]vo.AlarmRecord, int64, error)
	AcknowledgeAlarmRecordByID(id uint, req request.AcknowledgeAlarmRecord) error
	GetAlarmRecordAcknowledgeByID(id uint) (*vo.AlarmRecordAcknowledge, error)

	DeleteAlarmRecordByID(id uint) error
}
