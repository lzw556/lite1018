package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleGroup struct {
	repository
}

var _ dependency.AlarmRuleGroupRepository = &AlarmRuleGroup{}

func (repo AlarmRuleGroup) Create(ctx context.Context, e *entity.AlarmRuleGroup) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRuleGroup) Save(ctx context.Context, e *entity.AlarmRuleGroup) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmRuleGroup) Get(ctx context.Context, id uint) (entity.AlarmRuleGroup, error) {
	var e entity.AlarmRuleGroup

	if err := repo.DB(ctx).First(&e, id).Error; err != nil {
		return entity.AlarmRuleGroup{}, err
	}

	return e, nil
}

func (repo AlarmRuleGroup) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.AlarmRuleGroup{}, id).Error
}

func (repo AlarmRuleGroup) PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.AlarmRuleGroups, int64, error) {
	db := repo.DB(ctx).Model(&entity.AlarmRuleGroup{}).Scopes(specification.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.AlarmRuleGroup
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRuleGroup) FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroups, error) {
	var es []entity.AlarmRuleGroup
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmRuleGroup) GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroup, error) {
	var e entity.AlarmRuleGroup
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).First(&e).Error
	return e, err
}
