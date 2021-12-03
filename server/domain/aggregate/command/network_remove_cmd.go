package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type NetworkRemoveCmd struct {
	entity.Network

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkRemoveCmd() NetworkRemoveCmd {
	return NetworkRemoveCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkRemoveCmd) Run() error {
	ctx := context.TODO()
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.networkRepo.Delete(txCtx, cmd.Network.ID); err != nil {
			return err
		}
		return cmd.deviceRepo.DeleteBySpecs(txCtx, spec.NetworkEqSpec(cmd.Network.ID))
	})
}
