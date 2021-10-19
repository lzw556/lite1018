package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRecord struct {
	repository
}

func (repo AlarmRecord) Create(ctx context.Context, e *po.AlarmRecord) error {
	return repo.DB(ctx).Create(e).Error
}
