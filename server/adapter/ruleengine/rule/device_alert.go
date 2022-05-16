package rule

import (
	"context"
	"github.com/bilibili/gengine/engine"
	"github.com/shopspring/decimal"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"strings"
)

type DeviceAlert struct {
	id                   uint
	alarmRule            entity.AlarmRule
	sensorDataRepo       dependency.SensorDataRepository
	deviceRepo           dependency.DeviceRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
	alarmRecordRepo      dependency.AlarmRecordRepository
}

func NewDeviceAlert(sourceID uint, e entity.AlarmRule) *DeviceAlert {
	return &DeviceAlert{
		id:                   sourceID,
		alarmRule:            e,
		sensorDataRepo:       repository.SensorData{},
		deviceRepo:           repository.Device{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
		alarmRecordRepo:      repository.AlarmRecord{},
	}
}

func (a *DeviceAlert) Value(source interface{}) float64 {
	if device, ok := source.(entity.Device); ok {
		if t := devicetype.Get(device.Type); t != nil {
			var field devicetype.Field
			var property devicetype.Property
			// find the field
			for _, p := range t.Properties(t.SensorID()) {
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
			data, err := a.sensorDataRepo.Last(device.MacAddress, t.SensorID())
			if err != nil {
				return 0
			}
			value, _ := decimal.NewFromFloat32(cast.ToFloat32(data.Values[field.Key])).Round(int32(property.Precision)).Float64()
			return value
		}
	}
	return 0
}

func (a *DeviceAlert) Execute(engine *engine.GenginePool) error {
	source, err := a.deviceRepo.Get(context.TODO(), a.id)
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

func (a *DeviceAlert) Alert(source interface{}, value float64) {
	if device, ok := source.(entity.Device); ok {
		alertState, err := a.deviceAlertStateRepo.Get(device.MacAddress, a.alarmRule.ID)
		if err != nil {
			return
		}
		if alertState.Rule.Level < a.alarmRule.Level {
			device.UpdateAlarmRuleState(a.alarmRule)
			if device.GetAlarmRuleState(a.alarmRule.ID).Duration == a.alarmRule.Duration {
				record := entity.AlarmRecord{
					AlarmRuleID: a.alarmRule.ID,
					SourceID:    device.ID,
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
				device.AlertNotify(a.alarmRule.Metric, value, a.alarmRule.Level)
				alertState.SetRule(a.alarmRule)
				alertState.SetRecord(record)
				if err := a.deviceAlertStateRepo.Create(device.MacAddress, alertState); err != nil {
					xlog.Errorf("create device alert state error: %v", err)
					return
				}
			}
		}
	}
}

func (a *DeviceAlert) Recovery(source interface{}, value float64) {
	if device, ok := source.(entity.Device); ok {
		device.RemoveAlarmRuleState(a.alarmRule.ID)
		alertState, err := a.deviceAlertStateRepo.Get(device.MacAddress, a.alarmRule.ID)
		if err != nil {
			return
		}
		if record, err := a.alarmRecordRepo.Get(context.TODO(), alertState.Record.ID); err == nil {
			record.Status = entity.AlarmRecordStatusRecovered
			err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
				if err := a.alarmRecordRepo.Save(txCtx, &record); err != nil {
					return err
				}
				return a.deviceAlertStateRepo.Delete(device.MacAddress, a.alarmRule.ID)
			})
			if err == nil {
				device.AlertNotify(a.alarmRule.Metric, value, 0)
			}
		}
	}
}
