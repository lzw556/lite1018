package alarm

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAlarmRule(req request.AlarmRule) error
	CreateAlarmRuleGroup(req request.AlarmRuleGroup) error
	PagingAlarmRules(page, size int, filters request.Filters) ([]vo.AlarmRule, int64, error)
	FindAlarmRules(filters request.Filters) ([]vo.AlarmRule, error)
	GetAlarmRuleByID(id uint) (*vo.AlarmRule, error)
	UpdateAlarmRuleByID(id uint, req request.AlarmRule) error
	UpdateAlarmRuleStatusByID(id uint, status uint8) error
	DeleteAlarmRuleByID(id uint) error
	CheckAlarmRuleName(name string) (bool, error)
	AddSourcesToAlarmRule(id uint, sources []uint) error
	RemoveSourcesFromAlarmRule(id uint, sources []uint) error
	AlarmRuleGroupBind(id uint, req request.AlarmRuleGroupBind) error
	AlarmRuleGroupUnbind(id uint, req request.AlarmRuleGroupUnbind) error
	UpdateAlarmRuleGroupBindings(id uint, req request.UpdateAlarmRuleGroupBindings) error
	UpdateAlarmRuleGroup(id uint, req request.UpdateAlarmRuleGroup) error
	GetAlarmRuleGroupByID(id uint) (*vo.AlarmRuleGroup, error)
	FindAlarmRuleGroups(filters request.Filters) ([]vo.AlarmRuleGroup, error)

	FindAlarmRecordByPaginate(page, size int, from, to int64, filters request.Filters) ([]vo.AlarmRecord, int64, error)
	GetAlarmRecordByID(id uint) (*vo.AlarmRecord, error)
	AcknowledgeAlarmRecordByID(id uint, req request.AcknowledgeAlarmRecord) error
	GetAlarmRecordAcknowledgeByID(id uint) (*vo.AlarmRecordAcknowledge, error)

	DeleteAlarmRecordByID(id uint) error
	DeleteAlarmRuleGroupByID(id uint) error

	GetAlarmRuleGroupsExportFileWithFilters(id uint, groupIDs []uint) (*vo.AlarmRuleGroupsExported, error)
	ImportAlarmRuleGroups(req request.AlarmRuleGroupsImported) error
}
