package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecord struct {
	repository
}

func (repo AlarmRecord) Create(ctx context.Context, e *po.AlarmRecord) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo AlarmRecord) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.AlarmRecord, int64, error) {
	db := repo.DB(ctx).Model(&entity.AlarmRecord{}).Scopes(spec.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.AlarmRecord
	err := db.Scopes(repo.paginate(page, size)).Order("created_at DESC").Find(&es).Error
	return es, total, err
}

func (repo AlarmRecord) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.AlarmRecord, error) {
	var es []entity.AlarmRecord
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo AlarmRecord) UpdateBySpecs(ctx context.Context, updates map[string]interface{}, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Model(&po.AlarmRecord{}).Updates(updates).Error
}

func (repo AlarmRecord) Get(ctx context.Context, id uint) (entity.AlarmRecord, error) {
	var e entity.AlarmRecord
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo AlarmRecord) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.AlarmRecord{}, id).Error
}

func (repo AlarmRecord) Save(ctx context.Context, e *po.AlarmRecord) error {
	return repo.DB(ctx).Save(e).Error
}
