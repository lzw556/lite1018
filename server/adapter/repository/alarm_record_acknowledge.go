package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRecordAcknowledge struct {
	repository
}

func (repo AlarmRecordAcknowledge) Create(ctx context.Context, e *po.AlarmRecordAcknowledge) error {
	return repo.DB(ctx).Create(e).Error
}
