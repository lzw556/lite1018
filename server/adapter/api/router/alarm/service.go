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
	GetAlarmByID(id uint) (*vo.Alarm, error)
	UpdateAlarmByID(id uint, req request.UpdateAlarm) error
	DeleteAlarmByID(id uint) error

	GetAlarmRecordByID(id uint) (*vo.AlarmRecord, error)
	GetAlarmRecordAcknowledgeByID(id uint) (*vo.AlarmRecordAcknowledge, error)
	AcknowledgeAlarmRecordByID(id uint, req request.AcknowledgeAlarmRecord) error
	FindAlarmRecordsByPaginate(filters request.Filters, from, to int64, page, size int) ([]vo.AlarmRecord, int64, error)
	DeleteAlarmRecordByID(recordID uint) error
}
