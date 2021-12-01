package command

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"gorm.io/gorm"
	"time"
)

type DeviceUpdateCmd struct {
	entity.Device

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewDeviceUpdateCmd() DeviceUpdateCmd {
	return DeviceUpdateCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd DeviceUpdateCmd) UpdateBaseInfo(req request.Device) error {
	if cmd.Device.Name != req.Name {
		ctx := context.TODO()
		cmd.Device.Name = req.Name
		err := cmd.deviceRepo.Save(ctx, &cmd.Device.Device)
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
		if cmd.Device.GetConnectionState().IsOnline {
			command.SyncNetwork(network, devices, 3*time.Second)
		}
	}
	return nil
}

func (cmd DeviceUpdateCmd) UpdateSetting(req request.DeviceSetting) error {
	switch cmd.Device.TypeID {
	case devicetype.GatewayType:
		for _, key := range po.IPNSettingKeys {
			if value, ok := req[key]; ok {
				cmd.Device.IPN[key] = value
			}
		}
	case devicetype.RouterType:
	default:
		for _, key := range po.SensorSettingKeys[cmd.Device.TypeID] {
			if value, ok := req[key]; ok {
				cmd.Device.Sensors[key] = value
			}
		}
	}
	ctx := context.TODO()
	err := cmd.deviceRepo.Save(ctx, &cmd.Device.Device)
	if err != nil {
		return err
	}
	if network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID); err == nil {
		if gateway, err := cmd.deviceRepo.Get(ctx, network.GatewayID); err == nil {
			if gateway.GetConnectionState().IsOnline {
				command.SyncDeviceSettings(gateway, cmd.Device)
			}
		}
	}
	return nil
}

func (cmd DeviceUpdateCmd) updateGatewaySetting(period, timeOffset uint) error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Save(txCtx, &cmd.Device.Device); err != nil {
			return err
		}
		return cmd.networkRepo.UpdateByGatewayID(txCtx, cmd.Device.ID, period, timeOffset)
	})
	if err != nil {
		return err
	}
	return nil
}

func (cmd DeviceUpdateCmd) updateSensorSetting() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		return cmd.deviceRepo.Save(txCtx, &cmd.Device.Device)
	})
	if err != nil {
		return err
	}
	return nil
}

func (cmd DeviceUpdateCmd) Replace(mac string) error {
	ctx := context.TODO()
	_, err := cmd.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(mac))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(errcode.DeviceMacExistsError, "")
	}
	network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID)
	err = transaction.Execute(ctx, func(txCtx context.Context) error {
		if network.ID != 0 {
			network.ReplaceDevice(cmd.Device, mac)
			if err := cmd.networkRepo.Save(txCtx, &network.Network); err != nil {
				return err
			}
		}
		cmd.Device.MacAddress = mac
		return cmd.deviceRepo.Save(txCtx, &cmd.Device.Device)
	})
	if err != nil {
		return err
	}
	return nil
}
