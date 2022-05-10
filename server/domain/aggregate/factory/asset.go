package factory

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type Asset struct {
	assetRepo dependency.AssetRepository
}

func NewAsset() Asset {
	return Asset{
		assetRepo: repository.Asset{},
	}
}

func (factory Asset) NewAssetCreateCmd(req request.CreateAsset) (*command.AssetCreateCmd, error) {
	if req.Type >= entity.AssetTypeUnknown {
		return nil, response.BusinessErr(errcode.AssetTypeUnknownError, "Unkown asset type.")
	}

	e := entity.Asset{}

	e.Name = req.Name
	e.Type = req.Type
	e.ParentID = req.ParentID
	e.ProjectID = req.ProjectID

	cmd := command.NewAssetCreateCmd()
	cmd.Asset = e
	return &cmd, nil
}

func (factory Asset) NewAssetUpdateCmd(assetID uint, req request.UpdateAsset) (*command.AssetUpdateCmd, error) {
	ctx := context.TODO()
	e, err := factory.assetRepo.Get(ctx, assetID)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "Invalid asset ID")
	}

	e.Name = req.Name
	e.Type = req.Type
	e.ParentID = req.ParentID

	cmd := command.NewAssetUpdateCmd()
	cmd.Asset = e
	return &cmd, nil
}

func (factory Asset) NewAssetRemoveCmd(assetID uint) (*command.AssetRemoveCmd, error) {
	ctx := context.TODO()
	e, err := factory.assetRepo.Get(ctx, assetID)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "Invalid asset ID")
	}

	cmd := command.NewAssetRemoveCmd()
	cmd.Asset = e
	return &cmd, nil
}
