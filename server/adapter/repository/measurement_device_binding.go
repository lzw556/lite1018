package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MeasurementDeviceBinding struct {
	repository
}

func (repo MeasurementDeviceBinding) BatchCreate(ctx context.Context, es ...po.MeasurementDeviceBinding) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo MeasurementDeviceBinding) GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.MeasurementDeviceBinding, error) {
	var e po.MeasurementDeviceBinding
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo MeasurementDeviceBinding) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.MeasurementDeviceBinding, error) {
	var es []po.MeasurementDeviceBinding
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo MeasurementDeviceBinding) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&po.MeasurementDeviceBinding{}).Error
}
