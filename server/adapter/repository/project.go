package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Project struct {
	repository
}

func (repo Project) Create(ctx context.Context, e *entity.Project) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Project) Save(ctx context.Context, e *entity.Project) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Project) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Project{}, id).Error
}

func (repo Project) Get(ctx context.Context, id uint) (entity.Project, error) {
	var e entity.Project
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Project) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Project, error) {
	var e entity.Project
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Project) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Project, int64, error) {
	var (
		es    []entity.Project
		total int64
	)
	db := repo.DB(ctx).Scopes(spec.Scopes(specs)...)
	err := db.Model(&entity.Project{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Project) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Project, error) {
	var es []entity.Project
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
