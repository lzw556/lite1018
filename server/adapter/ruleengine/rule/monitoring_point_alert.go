package rule

import (
	"context"
	"strings"

	"github.com/bilibili/gengine/engine"
	"github.com/shopspring/decimal"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type MonitoringPointAlert struct {
	id                            uint
	alarmRule                     entity.AlarmRule
	monitoringPointDataRepo       dependency.MonitoringPointDataRepository
	monitoringPointRepo           dependency.MonitoringPointRepository
	monitoringPointAlertStateRepo dependency.MonitoringPointAlertStateRepository
	alarmRecordRepo               dependency.AlarmRecordRepository
}

func NewMonitoringPointAlert(sourceID uint, e entity.AlarmRule) *MonitoringPointAlert {
	return &MonitoringPointAlert{
		id:                            sourceID,
		alarmRule:                     e,
		monitoringPointDataRepo:       repository.MonitoringPointData{},
		monitoringPointRepo:           repository.MonitoringPoint{},
		monitoringPointAlertStateRepo: repository.MonitoringPointAlertState{},
		alarmRecordRepo:               repository.AlarmRecord{},
	}
}

func (a *MonitoringPointAlert) Value(source interface{}) float64 {
	if monitoringPoint, ok := source.(entity.MonitoringPoint); ok {
		if t := monitoringpointtype.Get(monitoringPoint.Type); t != nil {
			var field monitoringpointtype.Field
			var property monitoringpointtype.Property
			// find the field
			for _, p := range t.Properties() {
				property = p
				keys := strings.SplitN(a.alarmRule.Metric.Key, ".", 2)
				if property.Key == keys[0] {
					for _, f := range property.Fields {
						if f.Key == keys[1] {
							field = f
							break
						}
					}
				}
			}
			data, err := a.monitoringPointDataRepo.Last(monitoringPoint.ID)
			if err != nil {
				return 0
			}
			value, _ := decimal.NewFromFloat32(cast.ToFloat32(data.Values[field.Key])).Round(int32(property.Precision)).Float64()
			return value
		}
	}
	return 0
}

func (a *MonitoringPointAlert) Execute(engine *engine.GenginePool) error {
	source, err := a.monitoringPointRepo.Get(context.TODO(), a.id)
	if err != nil {
		return err
	}
	data := map[string]interface{}{
		"rule":   a,
		"source": source,
	}
	err, _ = engine.ExecuteSelectedRules(data, []string{a.alarmRule.Name})
	if err != nil {
		return err
	}
	return nil
}

func (a *MonitoringPointAlert) Alert(source interface{}, value float64) {
	if monitoringPoint, ok := source.(entity.MonitoringPoint); ok {
		alertState, err := a.monitoringPointAlertStateRepo.Get(monitoringPoint.ID, a.alarmRule.ID)
		if err != nil {
			return
		}
		if alertState.Rule.Level < a.alarmRule.Level {
			monitoringPoint.UpdateAlarmRuleState(a.alarmRule)
			if monitoringPoint.GetAlarmRuleState(a.alarmRule.ID).Duration == a.alarmRule.Duration {
				record := entity.AlarmRecord{
					AlarmRuleID: a.alarmRule.ID,
					SourceID:    monitoringPoint.ID,
					Metric:      a.alarmRule.Metric,
					Level:       a.alarmRule.Level,
					Operation:   a.alarmRule.Operation,
					Threshold:   a.alarmRule.Threshold,
					Value:       value,
					ProjectID:   a.alarmRule.ProjectID,
					Category:    a.alarmRule.Category,
				}
				if err := a.alarmRecordRepo.Create(context.TODO(), &record); err != nil {
					xlog.Errorf("create alarm record failed: %v", err)
					return
				}
				monitoringPoint.AlertNotify(a.alarmRule.Metric, value, a.alarmRule.Level)
				alertState.SetRule(a.alarmRule)
				alertState.SetRecord(record)
				if err := a.monitoringPointAlertStateRepo.Create(monitoringPoint.ID, alertState); err != nil {
					xlog.Errorf("create monitoringPoint alert state error: %v", err)
					return
				}
			}
		}
	}
}

func (a *MonitoringPointAlert) Recovery(source interface{}, value float64) {
	if monitoringPoint, ok := source.(entity.MonitoringPoint); ok {
		monitoringPoint.RemoveAlarmRuleState(a.alarmRule.ID)
		alertState, err := a.monitoringPointAlertStateRepo.Get(monitoringPoint.ID, a.alarmRule.ID)
		if err != nil {
			return
		}
		if record, err := a.alarmRecordRepo.Get(context.TODO(), alertState.Record.ID); err == nil {
			record.Status = entity.AlarmRecordStatusRecovered
			err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
				if err := a.alarmRecordRepo.Save(txCtx, &record); err != nil {
					return err
				}
				return a.monitoringPointAlertStateRepo.Delete(monitoringPoint.ID, a.alarmRule.ID)
			})
			if err == nil {
				monitoringPoint.AlertNotify(a.alarmRule.Metric, value, 0)
			}
		}
	}
}
