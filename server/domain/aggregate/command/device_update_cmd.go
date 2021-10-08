package command

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
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
	cmd.Device.Name = req.Name
	return cmd.deviceRepo.Save(context.TODO(), &cmd.Device.Device)
}

func (cmd DeviceUpdateCmd) UpdateSetting(req request.DeviceSetting) error {
	switch cmd.Device.TypeID {
	case devicetype.GatewayType:
		for k := range cmd.Device.IPN {
			if value, ok := req[k]; ok {
				cmd.Device.IPN[k] = value
			}
		}
	default:
		for k := range cmd.Device.Sensors {
			if value, ok := req[k]; ok {
				cmd.Device.Sensors[k] = value
			}
		}
	}
	err := cmd.deviceRepo.Save(context.TODO(), &cmd.Device.Device)
	if err != nil {
		return err
	}
	iot.SyncDeviceSettings(cmd.Device.MacAddress, 3*time.Second)
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
	_, err := cmd.deviceRepo.GetBySpecs(ctx, spec.DeviceMacSpec(mac))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(response.DeviceMacExistsError, "")
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
		return cmd.deviceRepo.Save(ctx, &cmd.Device.Device)
	})
	if err != nil {
		return err
	}
	return nil
}
