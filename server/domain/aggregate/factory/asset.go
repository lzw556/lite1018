package factory

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
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

func (factory Asset) NewAssetStatisticQuery() (*query.AssetStatisticQuery, error) {
	ctx := context.TODO()
	es, err := factory.assetRepo.Find(ctx)
	if err != nil {
		return nil, err
	}
	q := query.NewAssetStatisticQuery()
	for _, e := range es {
		if _, ok := q.DeviceMap[e.ID]; !ok {
			q.DeviceMap[e.ID], _ = factory.deviceRepo.FindBySpecs(ctx, spec.AssetSpec(e.ID))
		}
	}
	q.Assets = es
	return &q, nil
}
