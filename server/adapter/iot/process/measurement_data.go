package process

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/strategy/measurement"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type MeasurementData struct {
	bindingRepo         dependency.MeasurementDeviceBindingRepository
	measurementRepo     dependency.MeasurementRepository
	measurementDataRepo dependency.MeasurementDataRepository
	deviceDataRepo      dependency.SensorDataRepository
	alarmRepo           dependency.AlarmRepository
}

func NewMeasurementData() Processor {
	return MeasurementData{
		bindingRepo:         repository.MeasurementDeviceBinding{},
		deviceDataRepo:      repository.SensorData{},
		measurementRepo:     repository.Measurement{},
		measurementDataRepo: repository.MeasurementData{},
		alarmRepo:           repository.Alarm{},
	}
}

func (p MeasurementData) Name() string {
	return "MeasurementData"
}

func (p MeasurementData) Next() Processor {
	return nil
}

func (p MeasurementData) Process(ctx *iot.Context, msg iot.Message) error {
	txCtx := context.TODO()
	bindings, err := p.bindingRepo.FindBySpecs(txCtx, spec.DeviceMacEqSpec(msg.Body.Device))
	if err != nil {
		return err
	}
	if len(bindings) == 1 {
		m, err := p.measurementRepo.Get(txCtx, bindings[0].MeasurementID)
		if err != nil {
			return err
		}
		var strategy measurement.Strategy
		switch m.Type {
		case measurementtype.BoltLoosening:
			strategy = measurement.NewBoltLooseningStrategy()
		case measurementtype.BoltElongation:
			strategy = measurement.NewBoltElongationStrategy()
		case measurementtype.NormalTemperatureCorrosion:
			strategy = measurement.NewNormalTemperatureCorrosionStrategy()
		case measurementtype.Vibration:
			strategy = measurement.NewVibrationStrategy()
		case measurementtype.AngleDip:
			strategy = measurement.NewAngleDipStrategy()
		case measurementtype.FlangeElongation:
			strategy = measurement.NewFlangeElongationStrategy()
		default:
			return errcode.UnknownMeasurementTypeError
		}
		result, err := strategy.Do(m)
		if err != nil {
			return err
		}
		if err := p.measurementDataRepo.Create(result); err != nil {
			return fmt.Errorf("save measurement data failed: %v", err)
		}
		alarms, err := p.alarmRepo.FindBySpecs(context.TODO(), spec.MeasurementEqSpec(m.ID))
		if err != nil {
			return fmt.Errorf("find alarm failed: %v", err)
		}
		go ruleengine.ExecuteSelectedRules(m, alarms)
	}
	return nil
}
