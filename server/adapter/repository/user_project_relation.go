package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type UserProjectRelation struct {
	repository
}

func (repo UserProjectRelation) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.UserProjectRelation, error) {
	var es []po.UserProjectRelation
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo UserProjectRelation) BatchCreate(ctx context.Context, es []po.UserProjectRelation) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo UserProjectRelation) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&po.UserProjectRelation{}).Error
}
