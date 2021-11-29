package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Role struct {
	repository
}

func (repo Role) Create(ctx context.Context, e *po.Role) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Role) Save(ctx context.Context, e *po.Role) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Role) Paging(ctx context.Context, page, size int) ([]po.Role, int64, error) {
	var (
		es    []po.Role
		count int64
	)
	db := repo.DB(ctx).Model(&po.Role{})
	err := db.Count(&count).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, count, err
}

func (repo Role) Get(ctx context.Context, id uint) (po.Role, error) {
	var e po.Role
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Role) GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.Role, error) {
	var e po.Role
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}
