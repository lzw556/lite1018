package algorithm

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
	AlgorithmTypePlainData = iota + 1
)

type Algorithm struct {
	monitoringPointRepo              dependency.MonitoringPointRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
	monitoringPointDataRepo          dependency.MonitoringPointDataRepository
	alarmSourceRepo                  dependency.AlarmSourceRepository
	alarmRuleRepo                    dependency.AlarmRuleRepository
	mu                               sync.RWMutex
}

func NewAlgorithm() Algorithm {
	return Algorithm{
		monitoringPointRepo:              repository.MonitoringPoint{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
		monitoringPointDataRepo:          repository.MonitoringPointData{},
		alarmSourceRepo:                  repository.AlarmSource{},
		alarmRuleRepo:                    repository.AlarmRule{},
		mu:                               sync.RWMutex{},
	}
}

func (algo *Algorithm) ProcessDeviceSensorData(dev entity.Device, sensorData entity.SensorData) error {
	ctx := context.TODO()
	bindings, err := algo.monitoringPointDeviceBindingRepo.FindBySpecs(ctx, spec.DeviceIDEqSpec(dev.ID))
	if err != nil {
		return err
	}

	for _, binding := range bindings {
		mp, err := algo.monitoringPointRepo.Get(ctx, binding.MonitoringPointID)
		var mpData entity.MonitoringPointData
		if err == nil {
			switch binding.AlgorithmID {
			case AlgorithmTypePlainData:
				mpData = ProcessPlainData(mp, sensorData)
			default:
				mpData = ProcessPlainData(mp, sensorData)
			}

			err = algo.monitoringPointDataRepo.Create(mpData)
			if err != nil {
				return fmt.Errorf("Failed to save monitoring point data.")
			}
		}

		if sources, err := algo.alarmSourceRepo.FindBySpecs(context.TODO(), spec.SourceEqSpec(mp.ID)); err == nil {
			ids := make([]uint, len(sources))
			for i, source := range sources {
				ids[i] = source.AlarmRuleID
			}

			if alarmRules, err := algo.alarmRuleRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(ids), spec.CategoryEqSpec(entity.AlarmRuleCategoryMonitoringPoint)); err == nil {
				algo.mu.Lock()
				defer algo.mu.Unlock()
				ruleengine.ExecuteSelectedRules(mp.ID, alarmRules...)
			}
		}
	}

	return nil
}
