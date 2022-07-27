package command

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type AlarmRuleGroupImportCmd struct {
	alarmRuleGroupRepo dependency.AlarmRuleGroupRepository
	alarmRuleRepo      dependency.AlarmRuleRepository
}

func NewAlarmRuleGroupImportCmd() AlarmRuleGroupImportCmd {
	return AlarmRuleGroupImportCmd{
		alarmRuleGroupRepo: repository.AlarmRuleGroup{},
		alarmRuleRepo:      repository.AlarmRule{},
	}
}

func (importCmd AlarmRuleGroupImportCmd) newAlarmRuleGroupCreateCmd(req request.AlarmRuleGroup) (*AlarmRuleGroupCreateCmd, error) {
	ctx := context.TODO()
	e, err := importCmd.alarmRuleGroupRepo.GetBySpecs(ctx, spec.ProjectEqSpec(req.ProjectID), spec.NameEqSpec(req.Name))
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

	cmd := NewAlarmRuleGroupCreateCmd()

	cmd.RuleCreateCmds = make([]*AlarmRuleCreateCmd, 0)
	cmd.AlarmRuleGroup = e

	for _, r := range req.Rules {
		r.SourceType = req.Type
		r.Category = uint8(req.Category)
		r.ProjectID = req.ProjectID

		e, err := importCmd.alarmRuleRepo.GetBySpecs(ctx, spec.NameEqSpec(r.Name))
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if e.ID != 0 {
			return nil, response.BusinessErr(errcode.AlarmRuleNameExists, "")
		}

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

func convertAlarmRuleGroup(projectID uint, group request.AlarmRuleGroupImported) request.AlarmRuleGroup {
	result := request.AlarmRuleGroup{
		Name:        group.Name,
		Description: group.Description,
		Category:    group.Category,
		Type:        group.Type,
		Rules:       group.Rules,
		ProjectID:   projectID,
	}

	for i := range result.Rules {
		result.Rules[i].Name = fmt.Sprintf("%s (%d)", result.Rules[i].Name, time.Now().Unix())
	}

	return result
}

func (cmd AlarmRuleGroupImportCmd) ImportAlarmRuleGroups(req request.AlarmRuleGroupsImported) error {
	for _, group := range req.AlarmRuleGroups {
		g := convertAlarmRuleGroup(req.ProjectID, group)

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
