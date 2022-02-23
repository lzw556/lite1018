package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRule struct {
	repository
}

func (repo AlarmRule) Save(ctx context.Context, e *entity.AlarmRule) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmRule) Get(ctx context.Context, id uint) (entity.AlarmRule, error) {
	var e entity.AlarmRule
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo AlarmRule) Create(ctx context.Context, e *entity.AlarmRule) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRule) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.AlarmRule{}, id).Error
}

func (repo AlarmRule) Paging(ctx context.Context, page, size int) ([]entity.AlarmRule, int64, error) {
	db := repo.DB(ctx).Model(&entity.AlarmRule{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.AlarmRule
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRule) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.AlarmRule, int64, error) {
	db := repo.DB(ctx).Model(&entity.AlarmRule{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.AlarmRule
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRule) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.AlarmRule, error) {
	var es []entity.AlarmRule
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmRule) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.AlarmRule, error) {
	var e entity.AlarmRule
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}
