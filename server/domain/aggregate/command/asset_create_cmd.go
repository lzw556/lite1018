package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AssetCreateCmd struct {
	entity.Asset

	assetRepo dependency.AssetRepository
}

func NewAssetCreateCmd() AssetCreateCmd {
	return AssetCreateCmd{
		assetRepo: repository.Asset{},
	}
}

func (cmd AssetCreateCmd) Run() error {
	ctx := context.TODO()
	if err := cmd.assetRepo.Create(ctx, &cmd.Asset); err != nil {
		return err
	}

	return nil
}
