package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleMenuRelation struct {
	repository
}

func (repo RoleMenuRelation) Create(ctx context.Context, e *entity.RoleMenuRelation) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo RoleMenuRelation) BatchCreate(ctx context.Context, es []entity.RoleMenuRelation) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo RoleMenuRelation) Delete(ctx context.Context, id int64) error {
	return repo.DB(ctx).Delete(&entity.RoleMenuRelation{}, id).Error
}

func (repo RoleMenuRelation) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.RoleMenuRelation, error) {
	var es []entity.RoleMenuRelation
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo RoleMenuRelation) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&entity.RoleMenuRelation{}).Error
}
