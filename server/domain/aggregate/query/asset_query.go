package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type AssetQuery struct {
	Specs []spec.Specification

	assetRepo dependency.AssetRepository
}

func NewAssetQuery() AssetQuery {
	return AssetQuery{
		assetRepo: repository.Asset{},
	}
}

func (query AssetQuery) Paging(page, size int) ([]vo.Asset, int64, error) {
	ctx := context.TODO()
	es, total, err := query.assetRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	sort.Sort(es)
	result := make([]vo.Asset, len(es))
	for i, asset := range es {
		result[i] = query.newAsset(asset)
		query.iterSetChildren(&result[i])
	}
	return result, total, nil
}

func (query AssetQuery) newAsset(asset entity.Asset) vo.Asset {
	return vo.NewAsset(asset)
}

func (query AssetQuery) iterSetChildren(asset *vo.Asset) {
	children := query.getChildren(asset.ID)
	asset.Children = children
	for _, c := range asset.Children {
		query.iterSetChildren(c)
	}
}

func (query AssetQuery) getChildren(assetId uint) []*vo.Asset {
	es, err := query.assetRepo.FindBySpecs(context.TODO(), spec.ParentIdEqSpec(assetId))

	result := make([]*vo.Asset, 0)

	if err != nil {
		return result
	}

	for _, e := range es {
		asset := query.newAsset(e)
		result = append(result, &asset)
	}

	return result
}

func (query AssetQuery) List() ([]vo.Asset, error) {
	ctx := context.TODO()
	es, err := query.assetRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.Asset, len(es))
	for i, asset := range es {
		result[i] = query.newAsset(asset)
		query.iterSetChildren(&result[i])
	}
	return result, nil
}
