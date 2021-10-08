package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type DeviceRemoveCmd struct {
	entity.Device
	Network entity.Network

	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewDeviceRemoveCmd() DeviceRemoveCmd {
	return DeviceRemoveCmd{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	}
}

func (cmd DeviceRemoveCmd) Run() error {
	if cmd.Device.TypeID == devicetype.GatewayType {
		err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.deviceRepo.DeleteBySpecs(txCtx, spec.NetworkSpec(cmd.Network.ID)); err != nil {
				return err
			}
			return cmd.networkRepo.Delete(txCtx, cmd.Network.ID)
		})
		return err
	} else {
		err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
			if err := cmd.deviceRepo.Delete(txCtx, cmd.Device.ID); err != nil {
				return err
			}
			cmd.Network.RemoveDevice(cmd.Device)
			return cmd.networkRepo.Save(txCtx, &cmd.Network.Network)
		})
		return err
	}
}
