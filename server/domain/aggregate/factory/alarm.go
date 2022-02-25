package factory

import (
	"context"
	"errors"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
	"strings"
	"time"
)

type Alarm struct {
	alarmRecordRepo   dependency.AlarmRecordRepository
	alarmRuleRepo     dependency.AlarmRuleRepository
	alarmTemplateRepo dependency.AlarmTemplateRepository
}

func NewAlarm() Alarm {
	return Alarm{
		alarmRecordRepo:   repository.AlarmRecord{},
		alarmRuleRepo:     repository.AlarmRule{},
		alarmTemplateRepo: repository.AlarmTemplate{},
	}
}

func (factory Alarm) NewAlarmTemplateQuery(id uint) (*query.AlarmTemplateQuery, error) {
	e, err := factory.alarmTemplateRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmTemplateQuery()
	q.AlarmTemplate = e
	return &q, nil
}

func (factory Alarm) NewAlarmRuleCreateCmd(req request.AlarmRule) (*command.AlarmRuleCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleRepo.GetBySpecs(ctx, spec.NameEqSpec(req.Name))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if e.ID != 0 {
		return nil, response.BusinessErr(errcode.AlarmRuleNameExists, "")
	}
	e.Name = req.Name
	e.Description = req.Description
	e.Level = req.Level
	e.Duration = req.Duration
	e.Operation = req.Operation
	e.Threshold = req.Threshold
	e.SourceType = req.SourceType
	e.Metric = entity.AlarmRuleMetric{
		Key:  req.Metric.Key,
		Name: req.Metric.Name,
	}
	cmd := command.NewAlarmRuleCreateCmd()
	cmd.AlarmRule = e
	cmd.AlarmSources = make([]entity.AlarmSource, len(req.SourceIDs))
	for i, id := range req.SourceIDs {
		cmd.AlarmSources[i] = entity.AlarmSource{
			SourceID: id,
		}
	}
	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleQuery(filters ...request.Filter) (*query.AlarmRuleQuery, error) {
	q := query.NewAlarmRuleQuery()
	return &q, nil
}

func (factory Alarm) NewAlarmPagingQuery(filters request.Filters, page, size int) (*query.AlarmPagingQuery, error) {
	//ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
		case "measurement_id":
			specs = append(specs, spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
		}
	}
	//es, total, err := factory.alarmRuleRepo.PagingBySpecs(ctx, page, size, specs...)
	//if err != nil {
	//	return nil, err
	//}
	return nil, nil
}

func (factory Alarm) NewAlarmQuery(id uint) (*query.AlarmQuery, error) {
	//ctx := context.TODO()
	//e, err := factory.alarmRuleRepo.Get(ctx, id)
	//if err != nil {
	//	return nil, err
	//}
	//q := query.NewAlarmQuery()
	//q.Alarm = e
	return nil, nil
}

func (factory Alarm) NewAlarmRecordPagingQuery(filters request.Filters, from, to int64, page, size int) (*query.AlarmRecordPagingQuery, error) {
	ctx := context.TODO()
	specs := factory.buildFilterSpecs(filters)
	specs = append(specs, spec.CreatedAtRangeSpec{time.Unix(from, 0), time.Unix(to, 0)})

	es, total, err := factory.alarmRecordRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRecordPagingQuery(total)
	q.AlarmRecords = es
	return &q, nil
}

func (factory Alarm) buildFilterSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "measurement_id":
			specs = append(specs, spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
		case "asset_id":
		case "statues":
			statues := strings.Split(cast.ToString(filter.Value), ",")
			statuesSpec := make(spec.StatusInSpec, len(statues))
			for i, status := range statues {
				statuesSpec[i] = cast.ToUint(status)
			}
			specs = append(specs, statuesSpec)
		}
	}
	return specs
}

func (factory Alarm) NewAlarmRecordQuery(id uint) (*query.AlarmRecordQuery, error) {
	e, err := factory.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRecordQuery()
	q.AlarmRecord = e
	return &q, nil
}

func (factory Alarm) NewAlarmRecordCmd(id uint) (*command.AlarmRecordCmd, error) {
	e, err := factory.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	cmd := command.NewAlarmRecordCmd()
	cmd.AlarmRecord = e
	return &cmd, nil
}
