package factory

import (
	"context"
	"errors"
	"strings"

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
)

type Alarm struct {
	alarmRecordRepo    dependency.AlarmRecordRepository
	alarmRuleRepo      dependency.AlarmRuleRepository
	alarmRuleGroupRepo dependency.AlarmRuleGroupRepository
	alarmSourceRepo    dependency.AlarmSourceRepository
	alarmTemplateRepo  dependency.AlarmTemplateRepository
	projectRepo        dependency.ProjectRepository
}

func NewAlarm() Alarm {
	return Alarm{
		alarmRecordRepo:    repository.AlarmRecord{},
		alarmRuleRepo:      repository.AlarmRule{},
		alarmSourceRepo:    repository.AlarmSource{},
		alarmTemplateRepo:  repository.AlarmTemplate{},
		alarmRuleGroupRepo: repository.AlarmRuleGroup{},
		projectRepo:        repository.Project{},
	}
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
	e.Category = entity.AlarmRuleCategory(req.Category)
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

func (factory Alarm) NewAlarmRuleQuery(filters request.Filters) (*query.AlarmRuleQuery, error) {
	q := query.NewAlarmRuleQuery()
	q.Specs = make([]spec.Specification, 0)
	for name, v := range filters {
		switch name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "source_id":
			sources, err := factory.alarmSourceRepo.FindBySpecs(context.TODO(), spec.SourceEqSpec(cast.ToUint(v)))
			if err != nil {
				return nil, err
			}
			rulesSpec := make(spec.AlarmRuleInSpec, 0)
			for _, source := range sources {
				rulesSpec = append(rulesSpec, source.AlarmRuleID)
			}
		case "source_type":
			q.Specs = append(q.Specs, spec.SourceTypeEqSpec(cast.ToUint(v)))
		case "category":
			q.Specs = append(q.Specs, spec.CategoryEqSpec(cast.ToUint(v)))
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

func (factory Alarm) NewAlarmRecordQuery(filters request.Filters) (*query.AlarmRecordQuery, error) {
	q := query.NewAlarmRecordQuery()
	for name, v := range filters {
		switch name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "source_id":
			q.Specs = append(q.Specs, spec.SourceEqSpec(cast.ToUint(v)))
		case "status":
			statusInSpec := make(spec.StatusInSpec, 0)
			if cast.ToString(v) != "" {
				status := strings.Split(cast.ToString(v), ",")
				for _, s := range status {
					statusInSpec = append(statusInSpec, cast.ToUint(s))
				}
			}
			q.Specs = append(q.Specs, statusInSpec)
		case "levels":
			levels := strings.Split(cast.ToString(v), ",")
			levelsInSpec := make(spec.LevelInSpec, len(levels))
			for i, level := range levels {
				levelsInSpec[i] = cast.ToUint(level)
			}
			q.Specs = append(q.Specs, levelsInSpec)
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

func (factory Alarm) NewAlarmRecordRemoveCmd(id uint) (*command.AlarmRecordRemoveCmd, error) {
	e, err := factory.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AlarmRecordNotFoundError, "")
	}
	cmd := command.NewAlarmRecordRemoveCmd()
	cmd.AlarmRecord = e
	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupCreateCmd(req request.AlarmRuleGroup) (*command.AlarmRuleGroupCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleGroupRepo.GetBySpecs(ctx, spec.ProjectEqSpec(req.ProjectID), spec.NameEqSpec(req.Name))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if e.ID != 0 {
		return nil, response.BusinessErr(errcode.AlarmRuleGroupNameExists, "")
	}
	e.Name = req.Name
	e.Description = req.Description
	e.Type = req.Type
	e.Category = req.Category
	e.ProjectID = req.ProjectID
	e.Status = 1

	cmd := command.NewAlarmRuleGroupCreateCmd()

	cmd.RuleCreateCmds = make([]*command.AlarmRuleCreateCmd, 0)
	cmd.AlarmRuleGroup = e

	for _, r := range req.Rules {
		r.SourceType = req.Type
		r.Category = uint8(req.Category)
		r.ProjectID = req.ProjectID

		e, err := factory.alarmRuleRepo.GetBySpecs(ctx, spec.NameEqSpec(r.Name))
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if e.ID != 0 {
			return nil, response.BusinessErr(errcode.AlarmRuleNameExists, "")
		}

		c, err := factory.NewAlarmRuleCreateCmd(r)
		if err != nil {
			return &cmd, err
		}
		cmd.RuleCreateCmds = append(cmd.RuleCreateCmds, c)
	}

	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupUpdateCmd(id uint) (*command.AlarmRuleGroupUpdateCmd, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleGroupRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	cmd := command.NewAlarmRuleGroupUpdateCmd()
	cmd.AlarmRuleGroup = e

	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupRemoveCmd(id uint) (*command.AlarmRuleGroupRemoveCmd, error) {
	e, err := factory.alarmRuleGroupRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AlarmRuleGroupNotFoundError, "")
	}
	cmd := command.NewAlarmRuleGroupRemoveCmd()
	cmd.AlarmRuleGroup = e

	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupQuery(filters request.Filters) (*query.AlarmRuleGroupQuery, error) {
	q := query.NewAlarmRuleGroupQuery()
	for name, v := range filters {
		switch name {
		case "project_id":
			q.Specs = append(q.Specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "name":
			q.Specs = append(q.Specs, spec.NameEqSpec(cast.ToString(v)))
		case "monitoring_point_ids":
			values := cast.ToString(v)
			ids := strings.Split(values, ",")
			for _, mpID := range ids {
				q.MonitoringPointIDs = append(q.MonitoringPointIDs, cast.ToUint(mpID))
			}
		}
	}
	return &q, nil
}

func (factory Alarm) NewAlarmRuleGroupBindingCmd(id uint) (*command.AlarmRuleGroupBindCmd, error) {
	e, err := factory.alarmRuleGroupRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.AlarmRuleGroupNotFoundError, "")
	}

	cmd := command.NewAlarmRuleGroupBindCmd()
	cmd.AlarmRuleGroup = e
	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupExportCmd(id uint) (*command.AlarmRuleGroupExportCmd, error) {
	e, err := factory.projectRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, response.BusinessErr(errcode.ProjectNotFoundError, "")
	}
	cmd := command.NewAlarmRuleGroupExportCmd()
	cmd.Project = e
	return &cmd, nil
}

func (factory Alarm) NewAlarmRuleGroupImportCmd() (*command.AlarmRuleGroupImportCmd, error) {
	cmd := command.NewAlarmRuleGroupImportCmd()
	return &cmd, nil
}
