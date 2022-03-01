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
		Unit: req.Metric.Unit,
	}
	e.ProjectID = req.ProjectID
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

func (factory Alarm) NewAlarmRuleUpdateCmd(id uint) (*command.AlarmRuleUpdateCmd, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AlarmRuleNotFoundError, "")
	}
	cmd := command.NewAlarmRuleUpdateCmd()
	cmd.AlarmRule = e
	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleQuery(filters ...request.Filter) (*query.AlarmRuleQuery, error) {
	q := query.NewAlarmRuleQuery()
	q.Specs = make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		}
	}
	return &q, nil
}

func (factory Alarm) NewAlarmRuleDeleteCmd(id uint) (*command.AlarmRuleDeleteCmd, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AlarmRuleNotFoundError, "")
	}
	cmd := command.NewAlarmRuleDeleteCmd()
	cmd.AlarmRule = e
	return &cmd, nil
}

func (factory Alarm) NewAlarmRecordQuery(filters ...request.Filter) (*query.AlarmRecordQuery, error) {
	q := query.NewAlarmRecordQuery()
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		case "levels":
			levels := strings.Split(cast.ToString(filter.Value), ",")
			levelsInSpec := make(spec.LevelInSpec, len(levels))
			for i, level := range levels {
				levelsInSpec[i] = cast.ToUint(level)
			}
			q.Specs = append(q.Specs, spec.LevelInSpec(levelsInSpec))
		}
	}
	return &q, nil
}

func (factory Alarm) NewAlarmRecordUpdateCmd(id uint) (*command.AlarmRecordUpdateCmd, error) {
	e, err := factory.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	cmd := command.NewAlarmRecordUpdateCmd()
	cmd.AlarmRecord = e
	return &cmd, nil
}
