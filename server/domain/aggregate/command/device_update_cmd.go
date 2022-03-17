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
	"time"
)

type DeviceUpdateCmd struct {
	entity.Device

	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
	networkRepo     dependency.NetworkRepository
}

func NewDeviceUpdateCmd() DeviceUpdateCmd {
	return DeviceUpdateCmd{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
		networkRepo:     repository.Network{},
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
			if state, err := cmd.deviceStateRepo.Get(gateway.MacAddress); err == nil && state.IsOnline {
				command.SyncDeviceSettings(gateway, cmd.Device)
			}
		}
	}
	return nil
}
