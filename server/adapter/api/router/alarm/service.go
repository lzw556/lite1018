package alarm

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateAlarmTemplate(req request.AlarmTemplate) error
	FindAlarmTemplatesByPaginate(filters request.Filters, page, size int) ([]vo.AlarmTemplate, int64, error)
	GetAlarmTemplate(id uint) (*vo.AlarmTemplate, error)
	UpdateAlarmTemplate(id uint, req request.AlarmTemplate) (*vo.AlarmTemplate, error)
	RemoveAlarmTemplate(id uint) error

	CheckAlarm(name string) error
	CreateAlarm(req request.CreateAlarm) error
	CreateAlarmFromTemplate(req request.CreateAlarmFromTemplate) error

	FindAlarmsByPaginate(filters request.Filters, page, size int) ([]vo.Alarm, int64, error)
	GetAlarm(id uint) (*vo.Alarm, error)
	UpdateAlarm(id uint, req request.UpdateAlarm) error
	RemoveAlarm(id uint) error

	GetAlarmRecord(recordID uint) (*vo.AlarmRecord, error)
	GetAlarmRecordAcknowledge(recordID uint) (*vo.AlarmRecordAcknowledge, error)
	AcknowledgeAlarmRecord(recordID uint, req request.AcknowledgeAlarmRecord) error
	FindAlarmRecordsByPaginate(filters request.Filters, from, to int64, page, size int) ([]vo.AlarmRecord, int64, error)
	RemoveAlarmRecord(recordID uint) error

	GetAlarmRecordStatistics(from, to int64, filters request.Filters) (vo.AlarmRecordStatistics, error)
}
