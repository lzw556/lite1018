package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type GatewayCreateCmd struct {
	po.Device
	Network po.Network

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewGatewayCreateCmd() GatewayCreateCmd {
	return GatewayCreateCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd GatewayCreateCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Create(txCtx, &cmd.Device); err != nil {
			return err
		}
		cmd.Network.GatewayID = cmd.Device.ID
		if err := cmd.networkRepo.Create(txCtx, &cmd.Network); err != nil {
			return err
		}
		cmd.Device.NetworkID = cmd.Network.ID
		if err := cmd.deviceRepo.Save(txCtx, &cmd.Device); err != nil {
			return err
		}
		return nil
	})
	return err
}
