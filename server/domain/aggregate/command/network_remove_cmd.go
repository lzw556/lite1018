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

	networkRepo           dependency.NetworkRepository
	deviceRepo            dependency.DeviceRepository
	deviceStateRepo       dependency.DeviceStateRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	deviceAlertStateRepo  dependency.DeviceAlertStateRepository
}

func NewNetworkRemoveCmd() NetworkRemoveCmd {
	return NetworkRemoveCmd{
		networkRepo:           repository.Network{},
		deviceRepo:            repository.Device{},
		deviceStateRepo:       repository.DeviceState{},
		deviceInformationRepo: repository.DeviceInformation{},
		deviceAlertStateRepo:  repository.DeviceAlertState{},
	}
}

func (cmd NetworkRemoveCmd) Run() error {
	ctx := context.TODO()
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.networkRepo.Delete(txCtx, cmd.Network.ID); err != nil {
			return err
		}
		devices, _ := cmd.deviceRepo.FindBySpecs(txCtx, spec.NetworkEqSpec(cmd.Network.ID))
		for _, device := range devices {
			cmd.removeDeviceCache(device)
		}
		return cmd.deviceRepo.DeleteBySpecs(txCtx, spec.NetworkEqSpec(cmd.Network.ID))
	})
}

func (cmd NetworkRemoveCmd) removeDeviceCache(device entity.Device) {
	_ = cmd.deviceStateRepo.Delete(device.MacAddress)
	_ = cmd.deviceInformationRepo.Delete(device.ID)
	_ = cmd.deviceAlertStateRepo.DeleteAll(device.MacAddress)
}
