package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type AssetUpdateCmd struct {
	entity.Asset

	assetRepo dependency.AssetRepository
}

func NewAssetUpdateCmd() AssetUpdateCmd {
	return AssetUpdateCmd{
		assetRepo: repository.Asset{},
	}
}

func (cmd AssetUpdateCmd) Run() error {
	ctx := context.TODO()
	var err error
	if err = cmd.assetRepo.Save(ctx, &cmd.Asset); err != nil {
		return err
	}

	return err
}
