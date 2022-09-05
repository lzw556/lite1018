package command

import (
	"context"
	"errors"
	"fmt"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"gorm.io/gorm"
)

type AlarmRuleGroupImportCmd struct {
	alarmRuleGroupRepo dependency.AlarmRuleGroupRepository
	alarmRuleRepo      dependency.AlarmRuleRepository
	projectRepo        dependency.ProjectRepository
}

func NewAlarmRuleGroupImportCmd() AlarmRuleGroupImportCmd {
	return AlarmRuleGroupImportCmd{
		alarmRuleGroupRepo: repository.AlarmRuleGroup{},
		alarmRuleRepo:      repository.AlarmRule{},
		projectRepo:        repository.Project{},
	}
}

func (importCmd AlarmRuleGroupImportCmd) newAlarmRuleGroupCreateCmd(req request.AlarmRuleGroup) (*AlarmRuleGroupCreateCmd, error) {
	ctx := context.TODO()
	e, err := importCmd.alarmRuleGroupRepo.GetBySpecs(ctx, spec.ProjectEqSpec(req.ProjectID), spec.NameEqSpec(req.Name))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if e.ID != 0 {
		return nil, fmt.Errorf("报警规则 %s 已存在", req.Name)
	}
	e.Name = req.Name
	e.Description = req.Description
	e.Type = req.Type
	e.Category = req.Category
	e.ProjectID = req.ProjectID
	e.Status = 1

	cmd := NewAlarmRuleGroupCreateCmd()

	cmd.RuleCreateCmds = make([]*AlarmRuleCreateCmd, 0)
	cmd.AlarmRuleGroup = e

	for _, r := range req.Rules {
		r.SourceType = req.Type
		r.Category = uint8(req.Category)
		r.ProjectID = req.ProjectID
		c, err := importCmd.newAlarmRuleCreateCmd(r)
		if err != nil {
			return &cmd, err
		}
		cmd.RuleCreateCmds = append(cmd.RuleCreateCmds, c)
	}

	return &cmd, nil
}

func (importCmd AlarmRuleGroupImportCmd) newAlarmRuleCreateCmd(req request.AlarmRule) (*AlarmRuleCreateCmd, error) {
	ctx := context.TODO()
	e, err := importCmd.alarmRuleRepo.GetBySpecs(ctx, spec.NameEqSpec(req.Name))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if e.ID != 0 {
		return nil, fmt.Errorf("报警子规则 %s 已存在", req.Name)
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
	cmd := NewAlarmRuleCreateCmd()
	cmd.AlarmRule = e
	cmd.AlarmSources = make([]entity.AlarmSource, len(req.SourceIDs))
	for i, id := range req.SourceIDs {
		cmd.AlarmSources[i] = entity.AlarmSource{
			SourceID: id,
		}
	}
	return &cmd, nil
}

func (cmd AlarmRuleGroupImportCmd) convertAlarmRuleGroup(projectID uint, group request.AlarmRuleGroupImported) request.AlarmRuleGroup {
	projectName := "报警规则导入"
	if proj, err := cmd.projectRepo.Get(context.TODO(), projectID); err == nil {
		projectName = proj.Name
	}

	result := request.AlarmRuleGroup{
		Name:        fmt.Sprintf("%s(%s)", group.Name, projectName),
		Description: group.Description,
		Category:    group.Category,
		Type:        group.Type,
		Rules:       group.Rules,
		ProjectID:   projectID,
	}

	for i := range result.Rules {
		result.Rules[i].Name = fmt.Sprintf("%s(%s)", result.Rules[i].Name, projectName)
	}

	return result
}

func (cmd AlarmRuleGroupImportCmd) ImportAlarmRuleGroups(req request.AlarmRuleGroupsImported) error {
	for _, group := range req.AlarmRuleGroups {
		g := cmd.convertAlarmRuleGroup(req.ProjectID, group)

		importCmd, err := cmd.newAlarmRuleGroupCreateCmd(g)
		if err != nil {
			return err
		}

		err = importCmd.Run()
		if err != nil {
			return err
		}
	}

	return nil
}
