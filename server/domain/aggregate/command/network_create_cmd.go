package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type NetworkCreateCmd struct {
	entity.Network

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewNetworkCreateCmd() NetworkCreateCmd {
	return NetworkCreateCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd NetworkCreateCmd) Run() error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Create(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		cmd.Network.Gateway.NetworkID = cmd.Network.Network.ID
		if err := cmd.deviceRepo.Create(txCtx, &cmd.Network.Gateway.Device); err != nil {
			return err
		}
		cmd.Network.Network.GatewayID = cmd.Network.Gateway.Device.ID
		return cmd.networkRepo.Save(txCtx, &cmd.Network.Network)
	})
}
