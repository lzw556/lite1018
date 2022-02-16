package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Menu struct {
	repository
}

func (repo Menu) Find(ctx context.Context) ([]entity.Menu, error) {
	var es []entity.Menu
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Menu) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Menu, error) {
	var es []entity.Menu
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
