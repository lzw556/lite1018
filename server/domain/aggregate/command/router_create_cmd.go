package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type RouterCreateCmd struct {
	po.Device

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewRouterCreateCmd() RouterCreateCmd {
	return RouterCreateCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd RouterCreateCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Create(txCtx, &cmd.Device); err != nil {
			return err
		}
		if cmd.NetworkID != 0 {
			network, err := cmd.networkRepo.Get(txCtx, cmd.NetworkID)
			if err != nil {
				return err
			}
			gateway, err := cmd.deviceRepo.Get(txCtx, network.GatewayID)
			if err != nil {
				return err
			}
			network.AccessDevices(gateway, entity.Device{Device: cmd.Device})
			return cmd.networkRepo.Save(txCtx, &network.Network)
		}
		return nil
	})
	return err
}
