package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type AssetRemoveCmd struct {
	po.Asset

	assetRepo            dependency.AssetRepository
	measurementRepo      dependency.MeasurementRepository
	measurementAlertRepo dependency.MeasurementAlertRepository
	bindingRepo          dependency.MeasurementDeviceBindingRepository
}

func NewAssetRemoveCmd() AssetRemoveCmd {
	return AssetRemoveCmd{
		assetRepo:            repository.Asset{},
		measurementRepo:      repository.Measurement{},
		measurementAlertRepo: repository.MeasurementAlert{},
		bindingRepo:          repository.MeasurementDeviceBinding{},
	}
}

func (cmd AssetRemoveCmd) Run() error {
	ctx := context.TODO()
	err := transaction.Execute(ctx, func(txCtx context.Context) error {
		return cmd.remove(txCtx, cmd.Asset)
	})
	if err != nil {
		return err
	}
	if err := global.DeleteFile("resources/assets", cmd.Asset.Image); err != nil {
		xlog.Warnf("remove asset [%d] image [%s] failed: %v", cmd.Asset.ID, cmd.Asset.Image, err)
	}
	return nil
}

func (cmd AssetRemoveCmd) remove(ctx context.Context, assets ...po.Asset) error {
	for _, asset := range assets {
		// Remove asset
		if err := cmd.assetRepo.Delete(ctx, asset.ID); err != nil {
			return err
		}
		// Remove measurements
		if measurements, err := cmd.measurementRepo.FindBySpecs(ctx, spec.AssetEqSpec(asset.ID)); err == nil {
			for _, measurement := range measurements {
				if err := cmd.measurementAlertRepo.Delete(measurement.ID); err != nil {
					return err
				}
				if err := cmd.measurementRepo.Delete(ctx, measurement.ID); err != nil {
					return err
				}
				if err := cmd.bindingRepo.DeleteBySpecs(ctx, spec.MeasurementEqSpec(measurement.ID)); err != nil {
					return err
				}
			}
		}
		// Remove children
		if children, err := cmd.assetRepo.FindBySpecs(ctx, spec.ParentIDEqSpec(asset.ID)); err == nil {
			if err := cmd.remove(ctx, children...); err != nil {
				return err
			}
		}
	}
	return nil
}
