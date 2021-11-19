package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AssetRemoveCmd struct {
	po.Asset

	assetRepo             dependency.AssetRepository
	deviceRepo            dependency.DeviceRepository
	deviceStatus          dependency.DeviceStatusRepository
	deviceAlertStateRepo  dependency.DeviceAlertStateRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
}

func NewAssetRemoveCmd() AssetRemoveCmd {
	return AssetRemoveCmd{
		assetRepo:             repository.Asset{},
		deviceRepo:            repository.Device{},
		deviceStatus:          repository.DeviceStatus{},
		deviceAlertStateRepo:  repository.DeviceAlertState{},
		deviceInformationRepo: repository.DeviceInformation{},
		networkRepo:           repository.Network{},
	}
}

func (cmd AssetRemoveCmd) Run() error {
	ctx := context.TODO()
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.AssetSpec(cmd.Asset.ID))
	if err != nil {
		return err
	}
	var network = uint(0)
	if len(devices) > 0 {
		network = devices[0].NetworkID
	}
	err = transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.assetRepo.Delete(txCtx, cmd.Asset.ID); err != nil {
			return err
		}
		if err := cmd.deviceRepo.DeleteBySpecs(txCtx, spec.AssetSpec(cmd.Asset.ID)); err != nil {
			return err
		}
		for _, device := range devices {
			if err := cmd.deviceStatus.Delete(device.ID); err != nil {
				return err
			}
			if err := cmd.deviceAlertStateRepo.Delete(device.ID); err != nil {
				return err
			}
			if err := cmd.deviceInformationRepo.Delete(device.ID); err != nil {
				return err
			}
		}
		return cmd.networkRepo.Delete(txCtx, network)
	})
	return err
}
