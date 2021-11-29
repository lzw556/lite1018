package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type RoleMenuRelation struct {
	repository
}

func (repo RoleMenuRelation) Create(ctx context.Context, e *po.RoleMenuRelation) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo RoleMenuRelation) BatchCreate(ctx context.Context, es []po.RoleMenuRelation) error {
	return repo.DB(ctx).Create(&es).Error
}

func (repo RoleMenuRelation) Delete(ctx context.Context, id int64) error {
	return repo.DB(ctx).Delete(&po.RoleMenuRelation{}, id).Error
}

func (repo RoleMenuRelation) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.RoleMenuRelation, error) {
	var es []po.RoleMenuRelation
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo RoleMenuRelation) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&po.RoleMenuRelation{}).Error
}
