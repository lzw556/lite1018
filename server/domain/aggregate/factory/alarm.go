package factory

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"time"
)

type Alarm struct {
	assetRepo             dependency.AssetRepository
	deviceRepo            dependency.DeviceRepository
	alarmRecordRepo       dependency.AlarmRecordRepository
	alarmRuleRepo         dependency.AlarmRuleRepository
	alarmRuleTemplateRepo dependency.AlarmRuleTemplateRepository
}

func NewAlarm() Alarm {
	return Alarm{
		assetRepo:             repository.Asset{},
		deviceRepo:            repository.Device{},
		alarmRecordRepo:       repository.AlarmRecord{},
		alarmRuleRepo:         repository.AlarmRule{},
		alarmRuleTemplateRepo: repository.AlarmRuleTemplate{},
	}
}

func (factory Alarm) NewAlarmRuleTemplateQuery(id uint) (*query.AlarmRuleTemplateQuery, error) {
	e, err := factory.alarmRuleTemplateRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRuleTemplateQuery()
	q.AlarmRuleTemplate = e
	return &q, nil
}

func (factory Alarm) NewAlarmRuleCreateCmd(req request.AlarmRule) (*command.AlarmRuleCreateCmd, error) {
	cmd := command.NewAlarmRuleCreateCmd()
	switch req.CreateType {
	case 0:
		cmd.AlarmRules = factory.buildAlarmRulesByCustom(req)
	case 1:
		rules, err := factory.buildAlarmRulesFormTemplates(req)
		if err != nil {
			return nil, err
		}
		cmd.AlarmRules = rules
	}
	return &cmd, nil
}

func (factory Alarm) buildAlarmRulesByCustom(req request.AlarmRule) po.AlarmRules {
	rules := make(po.AlarmRules, len(req.DeviceIDs))
	for i, id := range req.DeviceIDs {
		rules[i] = po.AlarmRule{
			Name:        fmt.Sprintf("%s%d", req.Name, i),
			Description: req.Description,
			DeviceID:    id,
			PropertyID:  req.PropertyID,
			Rule: po.AlarmRuleContent{
				Field:     req.Rule.Field,
				Method:    req.Rule.Method,
				Operation: req.Rule.Operation,
				Threshold: req.Rule.Threshold,
			},
			Level:   req.Level,
			Enabled: true,
		}
	}
	return rules
}

func (factory Alarm) buildAlarmRulesFormTemplates(req request.AlarmRule) (po.AlarmRules, error) {
	ctx := context.TODO()
	templates := make([]po.AlarmRuleTemplate, len(req.TemplateIDs))
	for i, id := range req.TemplateIDs {
		template, err := factory.alarmRuleTemplateRepo.Get(ctx, id)
		if err != nil {
			return nil, err
		}
		templates[i] = template
	}
	rules := make(po.AlarmRules, 0)
	for _, id := range req.DeviceIDs {
		for _, template := range templates {
			rules = append(rules, po.AlarmRule{
				Name:        fmt.Sprintf("%s%d", req.Name, len(rules)),
				Description: req.Description,
				DeviceID:    id,
				PropertyID:  template.PropertyID,
				Rule:        template.Rule,
				Enabled:     true,
			})
		}
	}
	return rules, nil
}

func (factory Alarm) NewAlarmRulePagingQuery(assetID, deviceID uint, page, size int) (*query.AlarmRulePagingQuery, error) {
	ctx := context.TODO()
	specs, err := factory.buildFilterSpecs(request.AlarmFilter{DeviceID: deviceID, AssetID: assetID})
	if err != nil {
		return nil, err
	}
	es, total, err := factory.alarmRuleRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRulePagingQuery(total)
	q.AlarmRules = es
	return &q, nil
}

func (factory Alarm) NewAlarmRuleQuery(id uint) (*query.AlarmRuleQuery, error) {
	ctx := context.TODO()
	e, err := factory.alarmRuleRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRuleQuery()
	q.AlarmRule = e
	return &q, nil
}

func (factory Alarm) NewAlarmRecordPagingQuery(from, to int64, page, size int, req request.AlarmFilter) (*query.AlarmRecordPagingQuery, error) {
	ctx := context.TODO()
	specs, err := factory.buildFilterSpecs(req)
	if err != nil {
		return nil, err
	}
	specs = append(specs, spec.LevelInSpec(req.AlarmLevels))
	specs = append(specs, spec.CreatedAtRangeSpec{time.Unix(from, 0), time.Unix(to, 0)})

	es, total, err := factory.alarmRecordRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRecordPagingQuery(total)
	q.AlarmRecords = es
	return &q, nil
}

func (factory Alarm) NewAlarmStatisticsQuery(from, to int64, req request.AlarmFilter) (*query.AlarmStatisticsQuery, error) {
	ctx := context.TODO()
	specs, err := factory.buildFilterSpecs(req)
	if err != nil {
		return nil, err
	}
	begin := time.Unix(from, 0)
	end := time.Unix(to, 0)
	specs = append(specs, spec.LevelInSpec(req.AlarmLevels))
	specs = append(specs, spec.CreatedAtRangeSpec{begin, end})
	es, err := factory.alarmRecordRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmStatisticsQuery()
	q.AlarmRecords = es
	days := int(time.Unix(to, 0).Sub(time.Unix(from, 0)).Hours()) / 24
	q.Times = []time.Time{begin}
	for i := 0; i < days; i++ {
		q.Times = append(q.Times, q.Times[i].Add(24*time.Hour))
	}
	return &q, nil
}

func (factory Alarm) buildFilterSpecs(filter request.AlarmFilter) ([]spec.Specification, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	if filter.DeviceID != 0 {
		specs = append(specs, spec.DeviceInSpec{filter.DeviceID})
	} else {
		if filter.AssetID != 0 {
			devices, err := factory.deviceRepo.FindBySpecs(ctx, spec.AssetEqSpec(filter.AssetID))
			if err != nil {
				return nil, err
			}
			deviceIDs := make([]uint, len(devices))
			for i, device := range devices {
				deviceIDs[i] = device.ID
			}
			specs = append(specs, spec.DeviceInSpec(deviceIDs))
		}
	}
	switch filter.Type {
	case "active":
		specs = append(specs, spec.IsActiveSpec(true))
	case "history":
		specs = append(specs, spec.IsActiveSpec(false))
	}
	if len(filter.Statuses) > 0 {
		specs = append(specs, spec.StatusInSpec(filter.Statuses))
	}
	return specs, nil
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
