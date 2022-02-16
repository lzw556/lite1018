package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordAcknowledge struct {
	repository
}

func (repo AlarmRecordAcknowledge) Create(ctx context.Context, e *entity.AlarmRecordAcknowledge) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRecordAcknowledge) GetSpecs(ctx context.Context, specs ...spec.Specification) (entity.AlarmRecordAcknowledge, error) {
	var e entity.AlarmRecordAcknowledge
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}
