package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmSource struct {
	repository
}

func (repo AlarmSource) Create(ctx context.Context, es ...entity.AlarmSource) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo AlarmSource) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.AlarmSource, error) {
	var es []entity.AlarmSource
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmSource) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&entity.AlarmSource{}).Error
}
