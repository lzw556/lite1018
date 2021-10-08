package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type NetworkAccessDevicesCmd struct {
	entity.Network
	Parent   entity.Device
	Children []entity.Device

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkAccessDevicesCmd() NetworkAccessDevicesCmd {
	return NetworkAccessDevicesCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkAccessDevicesCmd) Run() error {
	cmd.Network.AccessDevices(cmd.Parent, cmd.Children)
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		spec := specification.PrimaryKeysSpec{}
		for _, child := range cmd.Children {
			spec = append(spec, child.ID)
		}
		return cmd.deviceRepo.UpdatesBySpecs(txCtx, map[string]interface{}{"network_id": cmd.Network.ID}, spec)
	})
}
