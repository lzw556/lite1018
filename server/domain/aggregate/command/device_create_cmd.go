package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type DeviceCreateCmd struct {
	entity.Device
	Parent entity.Device

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
	network, err := cmd.networkRepo.Get(ctx, cmd.Device.NetworkID)
	if err != nil {
		return response.BusinessErr(errcode.NetworkNotFoundError, "")
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Create(txCtx, &cmd.Device); err != nil {
			return err
		}
		network.AddDevices(cmd.Parent, cmd.Device)
		return cmd.networkRepo.Save(txCtx, &network)
	})
}
