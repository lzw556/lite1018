package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type Property struct {
	repository
}

func (repo Property) FindByDeviceTypeID(ctx context.Context, typeID uint) ([]po.Property, error) {
	var es []po.Property
	err := repo.DB(ctx).Find(&es, "device_type_id = ?", typeID).Error
	return es, err
}

func (repo Property) Get(ctx context.Context, id uint) (po.Property, error) {
	var e po.Property
	err := repo.DB(ctx).First(&e, id).Error
	return e, err
}
