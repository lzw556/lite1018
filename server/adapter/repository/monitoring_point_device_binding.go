package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MonitoringPointDeviceBinding struct {
	repository
}

var _ dependency.MonitoringPointDeviceBindingRepository = &MonitoringPointDeviceBinding{}

func (repo MonitoringPointDeviceBinding) Create(ctx context.Context, e *entity.MonitoringPointDeviceBinding) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo MonitoringPointDeviceBinding) FindBySpecs(ctx context.Context, specs ...specification.Specification) ([]entity.MonitoringPointDeviceBinding, error) {
	var es []entity.MonitoringPointDeviceBinding
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo MonitoringPointDeviceBinding) FindByDeviceID(ctx context.Context, deviceID uint) (entity.MonitoringPointDeviceBinding, error) {
	var e entity.MonitoringPointDeviceBinding
	if err := repo.DB(ctx).Where("device_id = ?", deviceID).First(&e).Error; err != nil {
		return entity.MonitoringPointDeviceBinding{}, err
	}
	return e, nil
}

func (repo MonitoringPointDeviceBinding) DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error {
	return repo.DB(ctx).Scopes(specification.Scopes(specs)...).Delete(&entity.MonitoringPointDeviceBinding{}).Error
}
