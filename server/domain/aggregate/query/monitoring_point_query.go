package query

import (
	"context"
	"sort"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

type MonitoringPointQuery struct {
	Specs []spec.Specification

	monitoringPointRepo     dependency.MonitoringPointRepository
	monitoringPointDataRepo dependency.MonitoringPointDataRepository
}

func NewMonitoringPointQuery() MonitoringPointQuery {
	return MonitoringPointQuery{
		monitoringPointRepo:     repository.MonitoringPoint{},
		monitoringPointDataRepo: repository.MonitoringPointData{},
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

func (query MonitoringPointQuery) FindMonitoringPointDataByID(id uint, from, to time.Time) ([]vo.MonitoringPointData, error) {
	result := make([]vo.MonitoringPointData, 0)

	mp, err := query.monitoringPointRepo.Get(context.TODO(), id)

	if err != nil {
		return result, response.BusinessErr(errcode.MonitoringPointNotFoundError, err.Error())
	}

	if t := monitoringpointtype.Get(mp.Type); t != nil {
		data, err := query.monitoringPointDataRepo.Find(mp.ID, from, to)
		if err != nil {
			return nil, err
		}

		for i := range data {
			properties := make(vo.MPProperties, 0)
			for _, p := range t.Properties() {
				property := vo.NewMonitoringPointProperty(p)
				for _, field := range p.Fields {
					property.SetData(field.Name, data[i].Values[field.Key])
				}
				properties = append(properties, property)
			}
			r := vo.NewMonitoringPointData(data[i].Time)
			r.Values = properties
			result = append(result, r)
		}
	}

	return result, nil
}
