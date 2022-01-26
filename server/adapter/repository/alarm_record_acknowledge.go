package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordAcknowledge struct {
	repository
}

func (repo AlarmRecordAcknowledge) Create(ctx context.Context, e *po.AlarmRecordAcknowledge) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRecordAcknowledge) GetSpecs(ctx context.Context, specs ...spec.Specification) (po.AlarmRecordAcknowledge, error) {
	var e po.AlarmRecordAcknowledge
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}
