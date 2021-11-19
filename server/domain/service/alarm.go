package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type Alarm struct {
	template   dependency.AlarmRuleTemplateRepository
	repository dependency.AlarmRuleRepository
	record     dependency.AlarmRecordRepository
	factory    factory.Alarm
}

func NewAlarm() alarm.Service {
	return Alarm{
		template:   repository.AlarmRuleTemplate{},
		repository: repository.AlarmRule{},
		record:     repository.AlarmRecord{},
		factory:    factory.NewAlarm(),
	}
}

func (s Alarm) CreateAlarmRuleTemplate(req request.AlarmRuleTemplate) error {
	e := po.AlarmRuleTemplate{
		Name:         req.Name,
		DeviceTypeID: req.DeviceType,
		Description:  req.Description,
		PropertyID:   req.PropertyID,
		Level:        req.Level,
	}
	e.PropertyID = req.PropertyID
	e.Rule = po.AlarmRuleContent{
		Field:     req.Rule.Field,
		Method:    req.Rule.Method,
		Operation: req.Rule.Operation,
		Threshold: req.Rule.Threshold,
	}
	e.Level = req.Level
	return s.template.Create(context.TODO(), &e)
}

func (s Alarm) FindAlarmRuleTemplatesByPaginate(page, size int, deviceType uint) ([]vo.AlarmRuleTemplate, int64, error) {
	es, total, err := s.template.PagingBySpecs(context.TODO(), page, size, spec.DeviceTypeSpec(deviceType))
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmRuleTemplate, len(es))
	for i, e := range es {
		result[i] = vo.NewAlarmRuleTemplate(e)
	}
	return result, total, nil
}

func (s Alarm) GetAlarmRuleTemplate(id uint) (*vo.AlarmRuleTemplate, error) {
	query, err := s.factory.NewAlarmRuleTemplateQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Detail()
}

func (s Alarm) UpdateAlarmRuleTemplate(id uint, req request.AlarmRuleTemplate) (*vo.AlarmRuleTemplate, error) {
	ctx := context.TODO()
	e, err := s.template.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	e.Name = req.Name
	e.DeviceTypeID = req.DeviceType
	e.Description = req.Description
	e.PropertyID = req.PropertyID
	e.PropertyID = req.PropertyID
	e.Level = req.Level
	e.Rule = po.AlarmRuleContent{
		Field:     req.Rule.Field,
		Method:    req.Rule.Method,
		Operation: req.Rule.Operation,
		Threshold: req.Rule.Threshold,
	}
	if err := s.template.Save(ctx, &e); err != nil {
		return nil, err
	}
	result := vo.NewAlarmRuleTemplate(e)
	return &result, nil
}

func (s Alarm) RemoveAlarmRuleTemplate(id uint) error {
	return s.template.Delete(context.TODO(), id)
}

func (s Alarm) CheckAlarmRule(name string) error {
	es, err := s.repository.FindBySpecs(context.TODO(), spec.NameLike(name))
	if err != nil {
		return err
	}
	if len(es) > 0 {
		return response.BusinessErr(errcode.AlarmRuleNameExists, "")
	}
	return nil
}

func (s Alarm) CreateAlarmRule(req request.AlarmRule) error {
	cmd, err := s.factory.NewAlarmRuleCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Alarm) FindAlarmRulesByPaginate(assetID, deviceID uint, page, size int) ([]vo.AlarmRule, int64, error) {
	query, err := s.factory.NewAlarmRulePagingQuery(assetID, deviceID, page, size)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Query()
	return result, total, nil
}

func (s Alarm) GetAlarmRule(id uint) (*vo.AlarmRule, error) {
	query, err := s.factory.NewAlarmRuleQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Detail(), nil
}

func (s Alarm) UpdateAlarmRule(id uint, req request.UpdateAlarmRule) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, id)
	if err != nil {
		return response.BusinessErr(errcode.AlarmRuleNotFoundError, "")
	}
	e.Level = req.Level
	e.Rule.Threshold = req.Rule.Threshold
	e.Rule.Operation = req.Rule.Operation
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := s.repository.Save(txCtx, &e); err != nil {
			return err
		}
		return adapter.RuleEngine.UpdateRules(e)
	})
}

func (s Alarm) RemoveAlarmRule(id uint) error {
	e, err := s.repository.Get(context.TODO(), id)
	if err != nil {
		return response.BusinessErr(errcode.AlarmRuleNotFoundError, "")
	}
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := s.repository.Delete(txCtx, e.ID); err != nil {
			return err
		}
		if err := s.record.UpdateBySpecs(txCtx, map[string]interface{}{"status": 0}, spec.AlarmRule(e.ID)); err != nil {
			return err
		}
		return adapter.RuleEngine.RemoveRules(e.Name)
	})
}

func (s Alarm) FindAlarmRecordsByPaginate(from, to int64, page, size int, req request.AlarmFilter) ([]vo.AlarmRecord, int64, error) {
	query, err := s.factory.NewAlarmRecordPagingQuery(from, to, page, size, req)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Paging()
	return result, total, nil
}

func (s Alarm) GetAlarmRecord(recordID uint) (*vo.AlarmRecord, error) {
	query, err := s.factory.NewAlarmRecordQuery(recordID)
	if err != nil {
		return nil, err
	}
	return query.Detail()
}

func (s Alarm) AcknowledgeAlarmRecord(recordID, userID uint) error {
	cmd, err := s.factory.NewAlarmRecordCmd(recordID)
	if err != nil {
		return err
	}
	return cmd.AcknowledgeBy(userID)
}

func (s Alarm) RemoveAlarmRecord(recordID uint) error {
	return s.record.Delete(context.TODO(), recordID)
}

func (s Alarm) GetAlarmStatistics(from, to int64, req request.AlarmFilter) (vo.AlarmStatistics, error) {
	query, err := s.factory.NewAlarmStatisticsQuery(from, to, req)
	if err != nil {
		return vo.AlarmStatistics{}, err
	}
	return query.Query(), nil
}
