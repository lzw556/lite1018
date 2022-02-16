package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Role struct {
	repository
}

func (repo Role) Create(ctx context.Context, e *entity.Role) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Role) Save(ctx context.Context, e *entity.Role) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Role) Paging(ctx context.Context, page, size int) ([]entity.Role, int64, error) {
	var (
		es    []entity.Role
		count int64
	)
	db := repo.DB(ctx).Model(&entity.Role{})
	err := db.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, count, err
}

func (repo Role) Get(ctx context.Context, id uint) (entity.Role, error) {
	var e entity.Role
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Role) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Role{}, id).Error
}

func (repo Role) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Role, error) {
	var e entity.Role
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}
