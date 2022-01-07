package factory

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"strings"
	"time"
)

type Alarm struct {
	assetRepo         dependency.AssetRepository
	measurementRepo   dependency.MeasurementRepository
	alarmRecordRepo   dependency.AlarmRecordRepository
	alarmRepo         dependency.AlarmRepository
	alarmTemplateRepo dependency.AlarmTemplateRepository
}

func NewAlarm() Alarm {
	return Alarm{
		assetRepo:         repository.Asset{},
		measurementRepo:   repository.Measurement{},
		alarmRecordRepo:   repository.AlarmRecord{},
		alarmRepo:         repository.Alarm{},
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

func (factory Alarm) NewAlarmCustomCreateCmd(req request.CreateAlarm) (*command.AlarmCreateCmd, error) {
	alarms := make([]po.Alarm, len(req.MeasurementIDs))
	for i, id := range req.MeasurementIDs {
		alarms[i] = po.Alarm{
			Name:          fmt.Sprintf("%s%d", req.Name, i),
			Description:   req.Description,
			MeasurementID: id,
			Rule: po.AlarmRule{
				Field:     req.Rule.Field,
				Method:    req.Rule.Method,
				Operation: req.Rule.Operation,
				Threshold: req.Rule.Threshold,
			},
			Level:   req.Level,
			Enabled: true,
		}
	}
	cmd := command.NewAlarmCreateCmd()
	cmd.Alarms = alarms
	return &cmd, nil
}

func (factory Alarm) NewAlarmTemplateCreateCmd(req request.CreateAlarmFromTemplate) (*command.AlarmCreateCmd, error) {
	ctx := context.TODO()
	templates := make([]po.AlarmTemplate, len(req.TemplateIDs))
	for i, id := range req.TemplateIDs {
		template, err := factory.alarmTemplateRepo.Get(ctx, id)
		if err != nil {
			return nil, err
		}
		templates[i] = template
	}
	alarms := make(po.Alarms, 0)
	for _, id := range req.MeasurementIDs {
		for _, template := range templates {
			alarms = append(alarms, po.Alarm{
				Name:          fmt.Sprintf("%s%d", req.Name, len(alarms)),
				Description:   req.Description,
				MeasurementID: id,
				Rule:          template.Rule,
				Enabled:       true,
				Level:         template.Level,
			})
		}
	}
	cmd := command.NewAlarmCreateCmd()
	cmd.Alarms = alarms
	return &cmd, nil
}

func (factory Alarm) NewAlarmPagingQuery(filters request.Filters, page, size int) (*query.AlarmPagingQuery, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			measurement, err := factory.measurementRepo.FindBySpecs(ctx, spec.AssetEqSpec(cast.ToUint(filter.Value)))
			if err != nil {
				return nil, err
			}
			measurementInSpec := make(spec.MeasurementInSpec, len(measurement))
			for i, m := range measurement {
				measurementInSpec[i] = m.ID
			}
			specs = append(specs, measurementInSpec)
		case "measurement_id":
			specs = append(specs, spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
		}
	}
	es, total, err := factory.alarmRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmPagingQuery(total)
	q.Alarms = es
	return &q, nil
}

func (factory Alarm) NewAlarmQuery(id uint) (*query.AlarmQuery, error) {
	ctx := context.TODO()
	e, err := factory.alarmRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmQuery()
	q.Alarm = e
	return &q, nil
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

func (factory Alarm) NewAlarmRecordStatisticsQuery(from, to int64, filters request.Filters) (*query.AlarmRecordStatisticsQuery, error) {
	ctx := context.TODO()
	specs := factory.buildFilterSpecs(filters)
	begin := time.Unix(from, 0)
	end := time.Unix(to, 0)
	specs = append(specs, spec.CreatedAtRangeSpec{begin, end})
	es, err := factory.alarmRecordRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAlarmRecordStatisticsQuery()
	q.AlarmRecords = es
	days := int(time.Unix(to, 0).Sub(time.Unix(from, 0)).Hours()) / 24
	q.Times = []time.Time{begin}
	for i := 0; i < days; i++ {
		q.Times = append(q.Times, q.Times[i].Add(24*time.Hour))
	}
	return &q, nil
}

func (factory Alarm) buildFilterSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "measurement_id":
			specs = append(specs, spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
		case "asset_id":
			if measurements, err := factory.measurementRepo.FindBySpecs(context.TODO(), spec.AssetEqSpec(cast.ToUint(filter.Value))); err == nil {
				measurementsSpec := make(spec.MeasurementInSpec, len(measurements))
				for i, measurement := range measurements {
					measurementsSpec[i] = measurement.ID
				}
				specs = append(specs, measurementsSpec)
			}
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
