package service

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type Alarm struct {
	template   dependency.AlarmTemplateRepository
	repository dependency.AlarmRepository
	record     dependency.AlarmRecordRepository
	factory    factory.Alarm
}

func NewAlarm() alarm.Service {
	return Alarm{
		template:   repository.AlarmTemplate{},
		repository: repository.Alarm{},
		record:     repository.AlarmRecord{},
		factory:    factory.NewAlarm(),
	}
}

func (s Alarm) CreateAlarmTemplate(req request.AlarmTemplate) error {
	e := po.AlarmTemplate{
		Name:            req.Name,
		MeasurementType: req.MeasurementType,
		Description:     req.Description,
		Level:           req.Level,
	}
	e.Rule = po.AlarmRule{
		Field:     req.Rule.Field,
		Method:    req.Rule.Method,
		Operation: req.Rule.Operation,
		Threshold: req.Rule.Threshold,
	}
	return s.template.Create(context.TODO(), &e)
}

func (s Alarm) FindAlarmTemplatesByPaginate(filters request.Filters, page, size int) ([]vo.AlarmTemplate, int64, error) {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "measurement_type":
			specs = append(specs, spec.MeasurementTypeEqSpec(cast.ToUint(filter.Value)))
		}
	}
	es, total, err := s.template.PagingBySpecs(context.TODO(), page, size, specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmTemplate, len(es))
	for i, e := range es {
		result[i] = vo.NewAlarmTemplate(e)
	}
	return result, total, nil
}

func (s Alarm) GetAlarmTemplate(id uint) (*vo.AlarmTemplate, error) {
	query, err := s.factory.NewAlarmTemplateQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Detail()
}

func (s Alarm) UpdateAlarmTemplate(id uint, req request.AlarmTemplate) (*vo.AlarmTemplate, error) {
	ctx := context.TODO()
	e, err := s.template.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	e.Name = req.Name
	e.Description = req.Description
	e.Level = req.Level
	e.Rule = po.AlarmRule{
		Field:     req.Rule.Field,
		Method:    req.Rule.Method,
		Operation: req.Rule.Operation,
		Threshold: req.Rule.Threshold,
	}
	if err := s.template.Save(ctx, &e); err != nil {
		return nil, err
	}
	result := vo.NewAlarmTemplate(e)
	return &result, nil
}

func (s Alarm) RemoveAlarmTemplate(id uint) error {
	return s.template.Delete(context.TODO(), id)
}

func (s Alarm) CheckAlarm(name string) error {
	es, err := s.repository.FindBySpecs(context.TODO(), spec.NameLikeSpec(name))
	if err != nil {
		return err
	}
	if len(es) > 0 {
		return response.BusinessErr(errcode.AlarmRuleNameExists, "")
	}
	return nil
}

func (s Alarm) CreateAlarm(req request.CreateAlarm) error {
	cmd, err := s.factory.NewAlarmCustomCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Alarm) CreateAlarmFromTemplate(req request.CreateAlarmFromTemplate) error {
	cmd, err := s.factory.NewAlarmTemplateCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Alarm) FindAlarmsByPaginate(filters request.Filters, page, size int) ([]vo.Alarm, int64, error) {
	query, err := s.factory.NewAlarmPagingQuery(filters, page, size)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Query()
	return result, total, nil
}

func (s Alarm) GetAlarm(id uint) (*vo.Alarm, error) {
	query, err := s.factory.NewAlarmQuery(id)
	if err != nil {
		return nil, err
	}
	return query.Detail(), nil
}

func (s Alarm) UpdateAlarm(id uint, req request.UpdateAlarm) error {
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
		return ruleengine.UpdateRules(e)
	})
}

func (s Alarm) RemoveAlarm(id uint) error {
	e, err := s.repository.Get(context.TODO(), id)
	if err != nil {
		return response.BusinessErr(errcode.AlarmRuleNotFoundError, "")
	}
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := s.repository.Delete(txCtx, e.ID); err != nil {
			return err
		}
		if err := s.record.UpdateBySpecs(txCtx, map[string]interface{}{"status": 0}, spec.AlarmRuleEqSpec(e.ID)); err != nil {
			return err
		}
		return ruleengine.RemoveRules(e.Name)
	})
}

func (s Alarm) FindAlarmRecordsByPaginate(filters request.Filters, from, to int64, page, size int) ([]vo.AlarmRecord, int64, error) {
	query, err := s.factory.NewAlarmRecordPagingQuery(filters, from, to, page, size)
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

func (s Alarm) AcknowledgeAlarmRecord(recordID uint, req request.AcknowledgeAlarmRecord) error {
	cmd, err := s.factory.NewAlarmRecordCmd(recordID)
	if err != nil {
		return err
	}
	return cmd.AcknowledgeBy(req)
}

func (s Alarm) GetAlarmRecordAcknowledge(recordID uint) (*vo.AlarmRecordAcknowledge, error) {
	query, err := s.factory.NewAlarmRecordQuery(recordID)
	if err != nil {
		return nil, err
	}
	return query.GetAcknowledge()
}

func (s Alarm) RemoveAlarmRecord(recordID uint) error {
	return s.record.Delete(context.TODO(), recordID)
}

func (s Alarm) GetAlarmRecordStatistics(from, to int64, filters request.Filters) (vo.AlarmRecordStatistics, error) {
	query, err := s.factory.NewAlarmRecordStatisticsQuery(from, to, filters)
	if err != nil {
		return vo.AlarmRecordStatistics{}, err
	}
	return query.Query(), nil
}
