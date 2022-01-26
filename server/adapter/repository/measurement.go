package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Measurement struct {
	repository
}

func (repo Measurement) Create(ctx context.Context, e *po.Measurement) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Measurement) Get(ctx context.Context, id uint) (po.Measurement, error) {
	var e po.Measurement
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Measurement) Find(ctx context.Context) ([]po.Measurement, error) {
	var es []po.Measurement
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Measurement) Save(ctx context.Context, e *po.Measurement) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Measurement) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Measurement{}, id).Error
}

func (repo Measurement) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Measurement, error) {
	var es []po.Measurement
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
