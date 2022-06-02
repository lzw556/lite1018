package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AssetRemoveCmd struct {
	entity.Asset

	assetRepo                        dependency.AssetRepository
	monitoringPointRepo              dependency.MonitoringPointRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
}

func NewAssetRemoveCmd() AssetRemoveCmd {
	return AssetRemoveCmd{
		assetRepo:                        repository.Asset{},
		monitoringPointRepo:              repository.MonitoringPoint{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
	}
}

func (cmd AssetRemoveCmd) Run() error {
	q := query.NewAssetQuery()

	asset, err := q.Get(cmd.Asset.ID)
	if err != nil {
		return err
	}

	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		return cmd.iterRemove(txCtx, &asset)
	})
}

func (cmd AssetRemoveCmd) iterRemove(txCtx context.Context, asset *vo.Asset) error {
	for _, mp := range asset.MonitoringPoints {
		if err := cmd.monitoringPointDeviceBindingRepo.DeleteBySpecs(txCtx, spec.MonitoringPointIDEqSpec(mp.ID)); err != nil {
			return err
		}

		if err := cmd.monitoringPointRepo.Delete(txCtx, mp.ID); err != nil {
			return err
		}
	}

	for _, child := range asset.Children {
		if err := cmd.iterRemove(txCtx, child); err != nil {
			return err
		}
	}

	if err := cmd.assetRepo.Delete(txCtx, asset.ID); err != nil {
		return err
	}

	return nil
}
