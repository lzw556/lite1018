package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRuleTemplate struct {
	repository
}

func (repo AlarmRuleTemplate) Create(ctx context.Context, e *po.AlarmRuleTemplate) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRuleTemplate) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]po.AlarmRuleTemplate, int64, error) {
	db := repo.DB(ctx).Model(&po.AlarmRuleTemplate{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []po.AlarmRuleTemplate
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo AlarmRuleTemplate) Get(ctx context.Context, id uint) (po.AlarmRuleTemplate, error) {
	var e po.AlarmRuleTemplate
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo AlarmRuleTemplate) Save(ctx context.Context, e *po.AlarmRuleTemplate) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo AlarmRuleTemplate) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.AlarmRuleTemplate{}, id).Error
}
