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
	_ = context.TODO()

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
