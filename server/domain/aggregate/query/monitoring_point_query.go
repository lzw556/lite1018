package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type MonitoringPointQuery struct {
	Specs []spec.Specification

	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewMonitoringPointQuery() MonitoringPointQuery {
	return MonitoringPointQuery{
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (query MonitoringPointQuery) Paging(page, size int) ([]vo.MonitoringPoint, int64, error) {
	ctx := context.TODO()
	es, total, err := query.monitoringPointRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	sort.Sort(es)
	result := make([]vo.MonitoringPoint, len(es))
	for i, monitoringPoint := range es {
		result[i] = query.newMonitoringPoint(monitoringPoint)
	}
	return result, total, nil
}

func (query MonitoringPointQuery) newMonitoringPoint(monitoringPoint entity.MonitoringPoint) vo.MonitoringPoint {
	return vo.NewMonitoringPoint(monitoringPoint)
}

func (query MonitoringPointQuery) List() ([]vo.MonitoringPoint, error) {
	ctx := context.TODO()
	es, err := query.monitoringPointRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.MonitoringPoint, len(es))
	for i, monitoringPoint := range es {
		result[i] = query.newMonitoringPoint(monitoringPoint)
	}
	return result, nil
}
