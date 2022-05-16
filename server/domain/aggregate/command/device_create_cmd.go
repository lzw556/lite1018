package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceCreateCmd struct {
	entity.Device

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewDeviceCreateCmd() DeviceCreateCmd {
	return DeviceCreateCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd DeviceCreateCmd) Run() error {
	ctx := context.TODO()
	if err := cmd.deviceRepo.Create(ctx, &cmd.Device); err != nil {
		return err
	}
	network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID)
	if err != nil {
		return err
	}
	gateway, err := cmd.deviceRepo.Get(ctx, network.GatewayID)
	if err != nil {
		return err
	}
	go command.AddDevice(gateway, cmd.Device)
	return nil
}
