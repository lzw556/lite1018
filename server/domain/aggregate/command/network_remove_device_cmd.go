package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type NetworkRemoveDevicesCmd struct {
	entity.Network

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkRemoveDevicesCmd() NetworkRemoveDevicesCmd {
	return NetworkRemoveDevicesCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkRemoveDevicesCmd) Run(req request.RemoveDevices) error {
	ctx := context.TODO()
	err := transaction.Execute(ctx, func(txCtx context.Context) error {
		cmd.Network.UpdateRoutingTables(req.RoutingTables)
		if err := cmd.networkRepo.Save(ctx, &cmd.Network.Network); err != nil {
			return err
		}
		return cmd.deviceRepo.UpdatesBySpecs(txCtx, map[string]interface{}{"network_id": 0}, spec.PrimaryKeyInSpec(req.DeviceIDs))
	})
	if err != nil {
		return err
	}
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkSpec(cmd.Network.ID))
	if err != nil {
		return err
	}
	command.SyncNetwork(cmd.Network, devices, 3*time.Second)
	return nil
}
