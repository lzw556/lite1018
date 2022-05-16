package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Permission struct {
	repository
}

func (repo Permission) Create(ctx context.Context, e *entity.Permission) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Permission) Save(ctx context.Context, e *entity.Permission) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Permission) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Permission{}, id).Error
}

func (repo Permission) Paging(ctx context.Context, page, size int) ([]entity.Permission, int64, error) {
	var (
		es    []entity.Permission
		total int64
	)
	db := repo.DB(ctx).Model(&entity.Permission{})
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Permission) Find(ctx context.Context) ([]entity.Permission, error) {
	var es []entity.Permission
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Permission) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Permission, error) {
	var es []entity.Permission
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
