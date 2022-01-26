package service

import (
	"context"
	"fmt"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
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

func (s Asset) CreateAsset(req request.Asset) error {
	e := po.Asset{
		Name:      req.Name,
		ParentID:  req.ParentID,
		ProjectID: req.ProjectID,
	}
	if req.Image != nil {
		e.Image = fmt.Sprintf("%s%s", uuid.NewV1().String(), req.GetFileExt())
	}
	if req.Location != nil {
		e.Display.Location.X = req.Location.X
		e.Display.Location.Y = req.Location.Y
	}
	payload, err := req.UploadBytes()
	if err != nil {
		return err
	}
	return transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := s.repository.Create(txCtx, &e); err != nil {
			return err
		}
		if payload != nil {
			return global.SaveFile(e.Image, "resources/assets", payload)
		}
		return nil
	})
}

func (s Asset) UpdateAssetByID(assetID uint, req request.Asset) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, assetID)
	if err != nil {
		return response.BusinessErr(errcode.AssetNotFoundError, "")
	}
	e.Name = req.Name
	e.ParentID = req.ParentID
	e.ProjectID = req.ProjectID
	if req.Location != nil {
		e.Display.Location.X = req.Location.X
		e.Display.Location.Y = req.Location.Y
	}
	if req.Image != nil {
		if e.Image != "" {
			_ = global.DeleteFile("resources/assets", e.Image)
		} else {
			e.Image = fmt.Sprintf("%s%s", uuid.NewV1().String(), req.GetFileExt())
		}
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := s.repository.Save(txCtx, &e); err != nil {
			return err
		}
		if req.Image != nil {
			payload, err := req.UploadBytes()
			if err != nil {
				return err
			}
			return global.SaveFile(e.Image, "resources/assets", payload)
		}
		return nil
	})
}

func (s Asset) DeleteAssetByID(assetID uint) error {
	cmd, err := s.factory.NewAssetRemoveCmd(assetID)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Asset) FindAssetsByPaginate(page, size int, filters request.Filters) ([]vo.Asset, int64, error) {
	query, err := s.factory.NewAssetPagingQuery(page, size, filters)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Run()
	return result, total, nil
}

func (s Asset) GetAssetByID(assetID uint) (*vo.Asset, error) {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, assetID)
	if err != nil {
		return nil, response.BusinessErr(errcode.AssetNotFoundError, "")
	}
	result := vo.NewAsset(e)
	if parent, err := s.repository.Get(ctx, e.ParentID); err == nil {
		result.SetParent(parent)
	}
	return &result, nil
}

func (s Asset) StatisticalAssetByID(assetID uint) (*vo.AssetStatistic, error) {
	cmd, err := s.factory.NewAssetStatisticQuery(assetID)
	if err != nil {
		return nil, err
	}
	return cmd.Statistic()
}

func (s Asset) StatisticalAssets() ([]vo.AssetStatistic, error) {
	assets, err := s.repository.Find(context.TODO())
	if err != nil {
		return nil, err
	}
	result := make([]vo.AssetStatistic, len(assets))
	for i, e := range assets {
		cmd, err := s.factory.NewAssetStatisticQuery(e.ID)
		if err != nil {
			return nil, err
		}
		statistic, err := cmd.Statistic()
		if err != nil {
			return nil, err
		}
		result[i] = *statistic
	}
	return result, nil
}

func (s Asset) FilterAssets(filters request.Filters) ([]vo.Asset, error) {
	query, err := s.factory.NewAssetFilterQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Asset) GetAssetChildrenByID(id uint) ([]vo.Asset, error) {
	es, err := s.repository.FindBySpecs(context.TODO(), spec.ParentIDEqSpec(id))
	if err != nil {
		return nil, err
	}
	result := make([]vo.Asset, len(es))
	for i, e := range es {
		result[i] = vo.NewAsset(e)
	}
	return result, nil
}
