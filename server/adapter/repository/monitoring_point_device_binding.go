package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPointDeviceBinding struct {
	repository
}

var _ dependency.MonitoringPointDeviceBindingRepository = &MonitoringPointDeviceBinding{}

func (repo MonitoringPointDeviceBinding) Create(ctx context.Context, e *entity.MonitoringPointDeviceBinding) error {
	return repo.DB(ctx).Create(e).Error
}
