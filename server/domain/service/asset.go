package service

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Asset struct {
	repository dependency.AssetRepository
	factory    factory.Asset
}

func NewAsset() asset.Service {
	return Asset{
		repository: repository.Asset{},
		factory:    factory.NewAsset(),
	}
}

func (s Asset) CreateAsset(req request.CreateAsset) error {
	cmd, err := s.factory.NewAssetCreateCmd(req)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s Asset) GetAssetByID(id uint) (*vo.Asset, error) {
	ctx := context.TODO()
	asset, err := s.repository.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	voAsset := vo.NewAsset(asset)
	return &voAsset, nil
}

func (s Asset) UpdateAssetByID(id uint, req request.UpdateAsset) error {
	cmd, err := s.factory.NewAssetUpdateCmd(id, req)
	if err != nil {
		return err
	}

	return cmd.Run()
}

func (s Asset) DeleteAssetByID(id uint) error {
	cmd, err := s.factory.NewAssetRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.Run()
}
