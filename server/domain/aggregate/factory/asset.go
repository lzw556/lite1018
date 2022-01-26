package factory

import (
	"context"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Asset struct {
	assetRepo  dependency.AssetRepository
	deviceRepo dependency.DeviceRepository
}

func NewAsset() Asset {
	return Asset{
		assetRepo:  repository.Asset{},
		deviceRepo: repository.Device{},
	}
}

func (factory Asset) NewAssetPagingQuery(page, size int, filters request.Filters) (*query.AssetPagingQuery, error) {
	ctx := context.TODO()
	specs := factory.buildSpecs(filters)
	es, total, err := factory.assetRepo.PagingBySpecs(ctx, page, size, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAssetPagingQuery(total)
	q.Assets = es
	return &q, nil
}

func (factory Asset) NewAssetFilterQuery(filters request.Filters) (*query.AssetFilterQuery, error) {
	ctx := context.TODO()
	specs := factory.buildSpecs(filters)
	es, err := factory.assetRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewAssetFilterQuery()
	q.Assets = es
	return &q, nil
}

func (factory Asset) NewAssetStatisticQuery(assetID uint) (*query.AssetStatisticQuery, error) {
	ctx := context.TODO()
	asset, err := factory.assetRepo.Get(ctx, assetID)
	if err != nil {
		return nil, err
	}
	q := query.NewAssetStatisticQuery()
	q.Asset = asset
	q.Devices, _ = factory.deviceRepo.FindBySpecs(ctx, spec.AssetEqSpec(asset.ID))
	return &q, nil
}

func (factory Asset) NewAssetRemoveCmd(assetID uint) (*command.AssetRemoveCmd, error) {
	ctx := context.TODO()
	asset, err := factory.assetRepo.Get(ctx, assetID)
	if err != nil {
		return nil, err
	}
	cmd := command.NewAssetRemoveCmd()
	cmd.Asset = asset
	return &cmd, nil
}

func (factory Asset) NewAssetCreateCmd(req request.Asset) (*command.AssetCreateCmd, error) {
	cmd := command.NewAssetCreateCmd()
	cmd.Asset = po.Asset{
		Name:     req.Name,
		ParentID: req.ParentID,
		Image:    uuid.NewV1().String(),
	}
	if req.Location != nil {
		cmd.Asset.Display.Location.X = req.Location.X
		cmd.Asset.Display.Location.Y = req.Location.Y
	}
	return &cmd, nil
}

func (factory Asset) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(filter.Value)))
		}
	}
	return specs
}
