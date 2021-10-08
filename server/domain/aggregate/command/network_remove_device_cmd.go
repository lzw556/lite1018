package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type NetworkRemoveDeviceCmd struct {
	entity.Network
	Device entity.Device

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkRemoveDeviceCmd() NetworkRemoveDeviceCmd {
	return NetworkRemoveDeviceCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkRemoveDeviceCmd) Run() (*vo.Network, error) {
	cmd.Network.RemoveDevice(cmd.Device)
	ctx := context.TODO()
	err := transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(ctx, &cmd.Network.Network); err != nil {
			return err
		}
		cmd.Device.NetworkID = 0
		return cmd.deviceRepo.Save(txCtx, &cmd.Device.Device)
	})
	if err != nil {
		return nil, err
	}
	result := vo.NewNetwork(cmd.Network)
	if gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID); err == nil {
		result.AddGateway(gateway)
	}
	if devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkSpec(cmd.Network.ID)); err == nil {
		nodes := make([]vo.Device, len(devices))
		for i, device := range devices {
			nodes[i] = vo.NewDevice(device)
		}
		result.SetNodes(nodes)
	}
	return &result, nil
}
