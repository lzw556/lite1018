package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type User struct {
	repository
}

var _ dependency.UserRepository = &User{}

func (repo User) Get(ctx context.Context, id uint) (po.User, error) {
	var e po.User
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo User) GetBySpecs(ctx context.Context, specs ...spec.Specification) (po.User, error) {
	var e po.User
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo User) Paging(ctx context.Context, page, size int) ([]po.User, int64, error) {
	db := repo.DB(ctx).Model(&po.User{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.User
	if err := db.Scopes(repo.paginate(page, size)).Find(&es).Error; err != nil {
		return nil, 0, err
	}
	return es, total, nil
}

func (repo User) Create(ctx context.Context, e *po.User) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo User) Save(ctx context.Context, e *po.User) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo User) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.User{}, id).Error
}
