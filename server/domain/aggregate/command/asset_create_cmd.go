package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type AssetCreateCmd struct {
	po.Asset

	assetRepo dependency.AssetRepository
}

func NewAssetCreateCmd() AssetCreateCmd {
	return AssetCreateCmd{
		assetRepo: repository.Asset{},
	}
}

func (cmd AssetCreateCmd) Run(bytes []byte) error {
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := global.SaveFile(cmd.Asset.Image, "/resources/assets", bytes); err != nil {
			return err
		}
		return cmd.assetRepo.Create(txCtx, &cmd.Asset)
	})
}
