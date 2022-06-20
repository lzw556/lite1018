package repository

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleGroupSource struct {
	repository
}

var _ dependency.AlarmRuleGroupSourceRepository = &AlarmRuleGroupSource{}

func (repo AlarmRuleGroupSource) Create(ctx context.Context, e *entity.AlarmRuleGroupSource) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRuleGroupSource) Save(ctx context.Context, e *entity.AlarmRuleGroupSource) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmRuleGroupSource) Get(ctx context.Context, id uint) (entity.AlarmRuleGroupSource, error) {
	var e entity.AlarmRuleGroupSource

	if err := repo.DB(ctx).First(&e, id).Error; err != nil {
		return entity.AlarmRuleGroupSource{}, err
	}

	return e, nil
}

func (repo AlarmRuleGroupSource) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.AlarmRuleGroupSource{}, id).Error
}

func (repo AlarmRuleGroupSource) PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) (entity.AlarmRuleGroupSources, int64, error) {
	db := repo.DB(ctx).Model(&entity.AlarmRuleGroupSource{}).Scopes(specification.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.AlarmRuleGroupSource
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRuleGroupSource) FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroupSources, error) {
	var es []entity.AlarmRuleGroupSource
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmRuleGroupSource) GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.AlarmRuleGroupSource, error) {
	var e entity.AlarmRuleGroupSource
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo AlarmRuleGroupSource) DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error {
	return repo.DB(ctx).Scopes(specification.Scopes(specs)...).Delete(&entity.AlarmRuleGroupSource{}).Error
}
