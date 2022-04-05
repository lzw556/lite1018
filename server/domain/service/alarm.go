package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"gorm.io/gorm"
	"time"
)

type Alarm struct {
	factory factory.Alarm
	rule    dependency.AlarmRuleRepository
	record  dependency.AlarmRecordRepository
}

func NewAlarm() alarm.Service {
	return &Alarm{
		factory: factory.NewAlarm(),
		rule:    repository.AlarmRule{},
		record:  repository.AlarmRecord{},
	}
}

func (s Alarm) CreateAlarmRule(req request.AlarmRule) error {
	cmd, err := s.factory.NewAlarmRuleCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Alarm) PagingAlarmRules(page, size int, filters request.Filters) ([]vo.AlarmRule, int64, error) {
	query, err := s.factory.NewAlarmRuleQuery(filters)
	if err != nil {
		return nil, 0, err
	}
	return query.Paging(page, size)
}

func (s Alarm) FindAlarmRules(filters request.Filters) ([]vo.AlarmRule, error) {
	query, err := s.factory.NewAlarmRuleQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.List()
}

func (s Alarm) GetAlarmRuleByID(id uint) (*vo.AlarmRule, error) {
	query, err := s.factory.NewAlarmRuleQuery(nil)
	if err != nil {
		return nil, err
	}
	return query.Get(id)
}

func (s Alarm) UpdateAlarmRuleByID(id uint, req request.AlarmRule) error {
	cmd, err := s.factory.NewAlarmRuleUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.Update(req)
}

func (s Alarm) UpdateAlarmRuleStatusByID(id uint, status uint8) error {
	cmd, err := s.factory.NewAlarmRuleUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.UpdateStatus(status)
}

func (s Alarm) AddSourcesToAlarmRule(id uint, sources []uint) error {
	cmd, err := s.factory.NewAlarmRuleUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.AddSources(sources)
}

func (s Alarm) RemoveSourcesFromAlarmRule(id uint, sources []uint) error {
	cmd, err := s.factory.NewAlarmRuleUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.RemoveSources(sources)
}

func (s Alarm) DeleteAlarmRuleByID(id uint) error {
	cmd, err := s.factory.NewAlarmRuleDeleteCmd(id)
	if err != nil {
		return err
	}
	return cmd.Delete()
}

func (s Alarm) CheckAlarmRuleName(name string) (bool, error) {
	_, err := s.rule.GetBySpecs(context.TODO(), spec.NameEqSpec(name))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return true, nil
	}
	return false, err
}

func (s Alarm) FindAlarmRecordByPaginate(page, size int, from, to int64, filters request.Filters) ([]vo.AlarmRecord, int64, error) {
	query, err := s.factory.NewAlarmRecordQuery(filters)
	if err != nil {
		return nil, 0, err
	}
	return query.Paging(page, size, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Alarm) GetAlarmRecordByID(id uint) (*vo.AlarmRecord, error) {
	query, err := s.factory.NewAlarmRecordQuery(nil)
	if err != nil {
		return nil, err
	}
	return query.Get(id)
}

func (s Alarm) AcknowledgeAlarmRecordByID(id uint, req request.AcknowledgeAlarmRecord) error {
	cmd, err := s.factory.NewAlarmRecordUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.AcknowledgeBy(req)
}

func (s Alarm) GetAlarmRecordAcknowledgeByID(id uint) (*vo.AlarmRecordAcknowledge, error) {
	query, err := s.factory.NewAlarmRecordQuery(nil)
	if err != nil {
		return nil, err
	}
	return query.GetAcknowledge(id)
}

func (s Alarm) DeleteAlarmRecordByID(id uint) error {
	return s.record.Delete(context.TODO(), id)
}
