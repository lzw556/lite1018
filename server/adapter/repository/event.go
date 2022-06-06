package repository

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type Event struct {
	repository
}

func (repo Event) Create(ctx context.Context, e *entity.Event) error {
	return repo.DB(ctx).Create(e).Error
}

func (repo Event) FindBySpecs(ctx context.Context, specs ...spec.Specification) ([]entity.Event, error) {
	var es []entity.Event
	err := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Order("created_at DESC").Find(&es).Error
	return es, err
}

func (repo Event) PagingBySpecs(ctx context.Context, page, size int, specs ...spec.Specification) ([]entity.Event, int64, error) {
	db := repo.DB(ctx).Scopes(spec.Scopes(specs)...).Model(&entity.Event{})
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var es []entity.Event
	err := db.Scopes(repo.paginate(page, size)).Order("timestamp DESC").Find(&es).Error
	return es, total, err
}

func (repo Event) DeleteBySpecs(ctx context.Context, specs ...spec.Specification) error {
	return repo.DB(ctx).Scopes(spec.Scopes(specs)...).Delete(&entity.Event{}).Error
}
