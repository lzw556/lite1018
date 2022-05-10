package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AssetRemoveCmd struct {
	entity.Asset

	assetRepo dependency.AssetRepository
}

func NewAssetRemoveCmd() AssetRemoveCmd {
	return AssetRemoveCmd{
		assetRepo: repository.Asset{},
	}
}

func (cmd AssetRemoveCmd) Run() error {
	ctx := context.TODO()
	return cmd.assetRepo.Delete(ctx, cmd.Asset.ID)
}
