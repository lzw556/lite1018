package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type NetworkCreateCmd struct {
	po.Network
	Devices []po.Device

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkCreateCmd() NetworkCreateCmd {
	return NetworkCreateCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkCreateCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Create(txCtx, &cmd.Network); err != nil {
			return err
		}
		for i := range cmd.Devices {
			cmd.Devices[i].NetworkID = cmd.Network.ID
			if err := cmd.deviceRepo.Create(txCtx, &cmd.Devices[i]); err != nil {
				return err
			}
			if cmd.Devices[i].TypeID == devicetype.GatewayType {
				cmd.Network.GatewayID = cmd.Devices[i].ID
				if err := cmd.networkRepo.Save(txCtx, &cmd.Network); err != nil {
					return err
				}
			}
		}
		return nil
	})
	return err
}
