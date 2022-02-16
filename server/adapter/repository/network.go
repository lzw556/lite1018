package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Network struct {
	repository
}

func (repo Network) Create(ctx context.Context, e *entity.Network) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Network) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&entity.Network{}, id).Error
}

func (repo Network) Get(ctx context.Context, id uint) (entity.Network, error) {
	var e entity.Network
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}

func (repo Network) GetBySpecs(ctx context.Context, specs ...spec.Specification) (entity.Network, error) {
	var e entity.Network
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).First(&e).Error
	return e, err
}

func (repo Network) Find(ctx context.Context) ([]entity.Network, error) {
	var es []entity.Network
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Network) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Network, error) {
	var es []entity.Network
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}

func (repo Network) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Network, int64, error) {
	db := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Model(&entity.Network{})
	var (
		es    []entity.Network
		count int64
	)
	if err := db.Count(&count).Error; err != nil {
		return nil, 0, err
	}
	err := db.Scopes(repo.paginate(page, size)).Find(&es).Error
	return es, count, err
}

func (repo Network) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&entity.Network{}).Error
}

func (repo Network) UpdateByGatewayID(ctx context.Context, gatewayID, period, timeOffset uint) error {
	return repo.DB(ctx).Model(&entity.Network{}).Where("gateway_id = ?", gatewayID).Updates(map[string]interface{}{"communication_period": period, "communication_time_offset": timeOffset}).Error
}

func (repo Network) Save(ctx context.Context, e *entity.Network) error {
	return repo.DB(ctx).Save(e).Error
}
