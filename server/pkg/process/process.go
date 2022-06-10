package process

import (
	"context"
	"fmt"
	"sync"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

const (
	ProcessTypePlainData = iota + 1
)

type Process struct {
	monitoringPointRepo              dependency.MonitoringPointRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
	monitoringPointDataRepo          dependency.MonitoringPointDataRepository
	alarmSourceRepo                  dependency.AlarmSourceRepository
	alarmRuleRepo                    dependency.AlarmRuleRepository
	mu                               sync.RWMutex
}

func NewProcess() Process {
	return Process{
		monitoringPointRepo:              repository.MonitoringPoint{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
		monitoringPointDataRepo:          repository.MonitoringPointData{},
		alarmSourceRepo:                  repository.AlarmSource{},
		alarmRuleRepo:                    repository.AlarmRule{},
		mu:                               sync.RWMutex{},
	}
}

func (proc *Process) ProcessDeviceSensorData(dev entity.Device, sensorData entity.SensorData) error {
	ctx := context.TODO()
	bindings, err := proc.monitoringPointDeviceBindingRepo.FindBySpecs(ctx, spec.DeviceIDEqSpec(dev.ID))
	if err != nil {
		return err
	}

	for _, binding := range bindings {
		mp, err := proc.monitoringPointRepo.Get(ctx, binding.MonitoringPointID)
		if err != nil {
			continue
		}

		var mpData entity.MonitoringPointData
		switch binding.ProcessID {
		case ProcessTypePlainData:
			mpData = ProcessPlainData(mp, sensorData)
		default:
			mpData = ProcessPlainData(mp, sensorData)
		}

		err = proc.monitoringPointDataRepo.Create(mpData)
		if err != nil {
			return fmt.Errorf("Failed to save monitoring point data.")
		}

		if sources, err := proc.alarmSourceRepo.FindBySpecs(context.TODO(), spec.SourceEqSpec(mp.ID)); err == nil {
			ids := make([]uint, len(sources))
			for i, source := range sources {
				ids[i] = source.AlarmRuleID
			}

			if alarmRules, err := proc.alarmRuleRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(ids), spec.CategoryEqSpec(entity.AlarmRuleCategoryMonitoringPoint)); err == nil {
				proc.mu.Lock()
				defer proc.mu.Unlock()
				ruleengine.ExecuteSelectedRules(mp.ID, alarmRules...)
			}
		}
	}

	return nil
}

func (proc *Process) ProcessDeviceSensorRawData(dev entity.Device, sensorData entity.SensorData) error {
	ctx := context.TODO()
	bindings, err := proc.monitoringPointDeviceBindingRepo.FindBySpecs(ctx, spec.DeviceIDEqSpec(dev.ID))
	if err != nil {
		return err
	}

	for _, binding := range bindings {
		mp, err := proc.monitoringPointRepo.Get(ctx, binding.MonitoringPointID)
		if err != nil {
			continue
		}

		var mpData entity.MonitoringPointData
		switch binding.ProcessID {
		case ProcessTypePlainData:
			mpData = ProcessPlainRawData(mp, sensorData)
		default:
			mpData = ProcessPlainRawData(mp, sensorData)
		}

		err = proc.monitoringPointDataRepo.Create(mpData)
		if err != nil {
			return fmt.Errorf("Failed to save monitoring point data.")
		}
	}
	return nil
}
