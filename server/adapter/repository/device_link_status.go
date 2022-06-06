package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceLinkStatus struct {
	repository
}

func (repo DeviceLinkStatus) Create(ctx context.Context, e *entity.DeviceLinkStatus) error {
	return repo.DB(ctx).Create(e).Error
}
