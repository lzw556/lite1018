package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Menu struct {
	repository
}

func (repo Menu) Find(ctx context.Context) ([]po.Menu, error) {
	var es []po.Menu
	err := repo.DB(ctx).Find(&es).Error
	return es, err
}

func (repo Menu) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]po.Menu, error) {
	var es []po.Menu
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Find(&es).Error
	return es, err
}
