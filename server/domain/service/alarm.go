package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Alarm struct {
	factory factory.Alarm
}

func NewAlarm() alarm.Service {
	return &Alarm{
		factory: factory.NewAlarm(),
	}
}

func (s Alarm) CreateAlarmRule(req request.AlarmRule) error {
	cmd, err := s.factory.NewAlarmRuleCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Alarm) FindAlarmRuleByPaginate(page, size int, filters request.Filters) ([]vo.AlarmRule, int64, error) {
	query, err := s.factory.NewAlarmRuleQuery(filters...)
	if err != nil {
		return nil, 0, err
	}
	return query.Paging(page, size)
}

func (s Alarm) GetAlarmRuleByID(id uint) (*vo.AlarmRule, error) {
	query, err := s.factory.NewAlarmRuleQuery()
	if err != nil {
		return nil, err
	}
	return query.Get(id)
}
