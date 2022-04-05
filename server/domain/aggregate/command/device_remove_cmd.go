package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type DeviceRemoveCmd struct {
	entity.Device
	Network entity.Network

	deviceDataRepo        dependency.SensorDataRepository
	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStateRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
	eventRepo             dependency.EventRepository
	alarmSourceReo        dependency.AlarmSourceRepository
	alarmRuleRepo         dependency.AlarmRuleRepository
}

func NewDeviceRemoveCmd() DeviceRemoveCmd {
	return DeviceRemoveCmd{
		deviceRepo:            repository.Device{},
		deviceDataRepo:        repository.SensorData{},
		deviceStatusRepo:      repository.DeviceState{},
		deviceInformationRepo: repository.DeviceInformation{},
		networkRepo:           repository.Network{},
		eventRepo:             repository.Event{},
		alarmSourceReo:        repository.AlarmSource{},
		alarmRuleRepo:         repository.AlarmRule{},
	}
}

func (cmd DeviceRemoveCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Delete(txCtx, cmd.Device.ID); err != nil {
			return err
		}
		_ = cmd.deviceInformationRepo.Delete(cmd.Device.ID)
		_ = cmd.deviceStatusRepo.Delete(cmd.Device.MacAddress)
		if cmd.Device.NetworkID > 0 {
			return cmd.networkRepo.Save(txCtx, &cmd.Network)
		}
		return cmd.removeAlarmSource(txCtx)
	})
	if err != nil {
		return err
	}
	if cmd.Device.NetworkID > 0 {
		gateway, err := cmd.deviceRepo.Get(context.TODO(), cmd.Network.GatewayID)
		if err != nil {
			return err
		}
		command.DeleteDevice(gateway, cmd.Device)
	}
	return nil
}

func (cmd DeviceRemoveCmd) removeAlarmSource(ctx context.Context) error {
	alarmRules, err := cmd.alarmRuleRepo.FindBySpecs(ctx, spec.SourceTypeEqSpec(cmd.Device.Type), spec.CategoryEqSpec(uint(entity.AlarmRuleCategoryDevice)))
	if err != nil {
		return err
	}
	if len(alarmRules) > 0 {
		alarmRuleIDs := make([]uint, len(alarmRules))
		for i, rule := range alarmRules {
			alarmRuleIDs[i] = rule.ID
		}
		return cmd.alarmSourceReo.DeleteBySpecs(ctx, spec.AlarmRuleInSpec(alarmRuleIDs), spec.SourceEqSpec(cmd.Device.ID))
	}
	return nil
}

func (cmd DeviceRemoveCmd) RemoveData(sensorType uint, from, to time.Time) error {
	if sensorType == 0 {
		if t := devicetype.Get(cmd.Device.Type); t != nil {
			sensorType = t.SensorID()
		}
	}
	return cmd.deviceDataRepo.Delete(cmd.Device.MacAddress, sensorType, from, to)
}

func (cmd DeviceRemoveCmd) RemoveEvents(ids []uint) error {
	return cmd.eventRepo.DeleteBySpecs(context.TODO(), spec.SourceEqSpec(cmd.Device.ID), spec.PrimaryKeyInSpec(ids))
}

func (cmd DeviceRemoveCmd) RemoveAlarmRules(ids []uint) error {
	return cmd.alarmSourceReo.DeleteBySpecs(context.TODO(), spec.SourceEqSpec(cmd.Device.ID), spec.AlarmRuleInSpec(ids))
}
