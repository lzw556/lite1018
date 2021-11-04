package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Network struct {
	repository
}

func (repo Network) Create(ctx context.Context, e *po.Network) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Network) Delete(ctx context.Context, id uint) error {
	return repo.DB(ctx).Delete(&po.Network{}, id).Error
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

func (repo Network) UpdateByGatewayID(ctx context.Context, gatewayID, period, timeOffset uint) error {
	return repo.DB(ctx).Model(&po.Network{}).Where("gateway_id = ?", gatewayID).Updates(map[string]interface{}{"communication_period": period, "communication_time_offset": timeOffset}).Error
}

func (repo Network) Save(ctx context.Context, e *po.Network) error {
	return repo.DB(ctx).Save(e).Error
}
