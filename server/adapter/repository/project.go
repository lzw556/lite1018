package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Project struct {
	repository
}

func (repo Project) Create(ctx context.Context, e *po.Project) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Project) Save(ctx context.Context, e *po.Project) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Project) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Project{}, id).Error
}

func (repo Project) Get(ctx context.Context, id uint) (po.Project, error) {
	var e po.Project
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Project) GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.Project, error) {
	var e po.Project
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Project) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.Project, int64, error) {
	var (
		es    []po.Project
		total int64
	)
	db := repo.DB(ctx).Scopes(spec.Scopes(specs)...)
	err := db.Model(&po.Project{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Project) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Project, error) {
	var es []po.Project
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
