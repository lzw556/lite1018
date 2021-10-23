package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
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
	ctx := context.TODO()
	cmd.Network.AccessDevices(cmd.Parent, cmd.Children)
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		spec := specification.PrimaryKeysSpec{}
		for _, child := range cmd.Children {
			spec = append(spec, child.ID)
		}
		return cmd.deviceRepo.UpdatesBySpecs(txCtx, map[string]interface{}{"network_id": cmd.Network.ID}, spec)
	})
	if err != nil {
		return err
	}
	gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID)
	if err != nil {
		return err
	}
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, specification.NetworkSpec(cmd.Network.ID))
	if err != nil {
		return err
	}
	if iot.SyncWsnSettings(cmd.Network, gateway, false, 3*time.Second) {
		iot.SyncDeviceList(gateway, devices, 3*time.Second)
	}
	return nil
}
