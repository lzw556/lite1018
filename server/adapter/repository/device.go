package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Device struct {
	repository
}

var _ dependency.DeviceRepository = &Device{}

func (repo Device) Create(ctx context.Context, e *po.Device) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Device) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Device{}, id).Error
}

func (repo Device) DeleteBySpecs(ctx context.Context, specs ...specification.Specification) error {
	return repo.DB(ctx).Scopes(specification.Scopes(specs)...).Delete(&po.Device{}).Error
}

func (repo Device) Save(ctx context.Context, e *po.Device) error {
	return repo.DB(ctx).Save(e).Error
}

func (repo Device) BatchSave(ctx context.Context, es []po.Device) error {
	return repo.DB(ctx).Save(&es).Error
}

func (repo Device) UpdatesBySpecs(ctx context.Context, updates map[string]interface{}, specs ...specification.Specification) error {
	return repo.DB(ctx).Model(&po.Device{}).Scopes(specification.Scopes(specs)...).Updates(updates).Error
}

func (repo Device) Get(ctx context.Context, id uint) (entity.Device, error) {
	var e entity.Device
	if err := repo.DB(ctx).First(&e, id).Error; err != nil {
		return entity.Device{}, err
	}
	return e, nil
}

func (repo Device) Find(ctx context.Context, ids ...uint) ([]entity.Device, error) {
	var es []entity.Device
	err := repo.DB(ctx).Find(&es, ids).Error
	return es, err
}

func (repo Device) GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Device, error) {
	var e entity.Device
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Device) PagingBySpecs(ctx context.Context, page, size int, specs ...specification.Specification) ([]entity.Device, int64, error) {
	db := repo.DB(ctx).Model(&entity.Device{}).Scopes(specification.Scopes(specs)...)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Device
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Device) FindBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Devices, error) {
	var es []entity.Device
	err := repo.DB(ctx).Scopes(specification.Scopes(specs)...).Find(&es).Error
	return es, err
}
