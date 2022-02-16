package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserProjectRelation struct {
	repository
}

func (repo UserProjectRelation) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.UserProjectRelation, error) {
	var es []entity.UserProjectRelation
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo UserProjectRelation) BatchCreate(ctx context.Context, es []entity.UserProjectRelation) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo UserProjectRelation) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&entity.UserProjectRelation{}).Error
}
