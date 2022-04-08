package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type DeviceUpdateCmd struct {
	entity.Device

	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
	networkRepo     dependency.NetworkRepository
	alarmSourceRepo dependency.AlarmSourceRepository
}

func NewDeviceUpdateCmd() DeviceUpdateCmd {
	return DeviceUpdateCmd{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
		networkRepo:     repository.Network{},
		alarmSourceRepo: repository.AlarmSource{},
	}
}

func (cmd DeviceUpdateCmd) UpdateBaseInfo(req request.UpdateDevice) error {
	if cmd.Device.Name != req.Name {
		ctx := context.TODO()
		cmd.Device.Name = req.Name
		err := cmd.deviceRepo.Save(ctx, &cmd.Device)
		if err != nil {
			return err
		}
		devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(cmd.Device.NetworkID))
		if err != nil {
			return err
		}
		network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID)
		if err != nil {
			return err
		}
		if state, err := cmd.deviceStateRepo.Get(cmd.Device.MacAddress); err == nil && state.IsOnline {
			command.SyncNetwork(network, devices, 3*time.Second)
		}
	}
	return nil
}

func (cmd DeviceUpdateCmd) UpdateSettings(req request.DeviceSetting) error {
	t := devicetype.Get(cmd.Device.Type)
	if t == nil {
		return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	cmd.Device.Settings = make(entity.DeviceSettings, len(t.Settings()))
	for i, setting := range t.Settings() {
		s := entity.DeviceSetting{
			Key:      setting.Key,
			Category: string(setting.Category),
		}
		switch setting.Category {
		case devicetype.IpnSettingCategory:
			if value, ok := req.IPN[s.Key]; ok {
				s.Value = setting.Convert(value)
			} else {
				s.Value = setting.Convert(setting.Value)
			}
		case devicetype.SensorsSettingCategory:
			if value, ok := req.Sensors[s.Key]; ok {
				s.Value = setting.Convert(value)
			} else {
				s.Value = setting.Convert(setting.Value)
			}
		}
		cmd.Device.Settings[i] = s
	}
	ctx := context.TODO()
	err := cmd.deviceRepo.Save(ctx, &cmd.Device)
	if err != nil {
		return err
	}
	if network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID); err == nil {
		if gateway, err := cmd.deviceRepo.Get(ctx, network.GatewayID); err == nil {
			go command.UpdateDeviceSettings(gateway, cmd.Device)
		}
	}
	return nil
}

func (cmd DeviceUpdateCmd) AddAlarmRules(req request.DeviceAlarmRules) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.alarmSourceRepo.DeleteBySpecs(txCtx, spec.SourceEqSpec(cmd.Device.ID), spec.AlarmRuleInSpec(req.IDs)); err != nil {
			return err
		}
		sources := make([]entity.AlarmSource, len(req.IDs))
		for i, id := range req.IDs {
			sources[i] = entity.AlarmSource{
				SourceID:    cmd.Device.ID,
				AlarmRuleID: id,
			}
		}
		return cmd.alarmSourceRepo.Create(txCtx, sources...)
	})
}
