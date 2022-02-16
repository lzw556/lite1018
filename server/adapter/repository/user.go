package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type User struct {
	repository
}

var _ dependency.UserRepository = &User{}

func (repo User) Get(ctx context.Context, id uint) (entity.User, error) {
	var e entity.User
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo User) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.User, error) {
	var e entity.User
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo User) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.User, error) {
	var es []entity.User
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo User) Paging(ctx context.Context, page, size int) ([]entity.User, int64, error) {
	db := repo.DB(ctx).Model(&entity.User{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.User
	if err := db.Scopes(repo.paginate(page, size)).Find(&es).Error; err != nil {
		return nil, 0, err
	}
	return es, total, nil
}

func (repo User) Create(ctx context.Context, e *entity.User) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo User) Save(ctx context.Context, e *entity.User) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo User) Updates(ctx context.Context, e *entity.User, updates map[string]interface{}) error {
	return repo.DB(ctx).Model(e).Updates(updates).Error
}

func (repo User) UpdatesBySpecs(ctx context.Context, updates map[string]interface{}, specs ...spec.Specification) error {
	return repo.DB(ctx).Model(&entity.User{}).Scopes(spec.Scopes(specs)...).Updates(updates).Error
}

func (repo User) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.User{}, id).Error
}
