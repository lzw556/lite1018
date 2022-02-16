package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Firmware struct {
	repository
}

func (repo Firmware) Create(ctx context.Context, e *entity.Firmware) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Firmware) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Firmware, error) {
	var e entity.Firmware
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Firmware) FindByPaginate(ctx context.Context, page, size int) ([]entity.Firmware, int64, error) {
	db := repo.DB(ctx).Model(&entity.Firmware{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Firmware
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, total, err
}

func (repo Firmware) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Firmware, error) {
	var es []entity.Firmware
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo Firmware) Get(ctx context.Context, id uint) (entity.Firmware, error) {
	var e entity.Firmware
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Firmware) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Firmware{}, id).Error
}
