package query

import (
	"context"
	"sort"
	"time"

	"github.com/mitchellh/mapstructure"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

type MonitoringPointQuery struct {
	Specs []spec.Specification

	monitoringPointRepo              dependency.MonitoringPointRepository
	monitoringPointDataRepo          dependency.MonitoringPointDataRepository
	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
}

func NewMonitoringPointQuery() MonitoringPointQuery {
	return MonitoringPointQuery{
		monitoringPointRepo:              repository.MonitoringPoint{},
		monitoringPointDataRepo:          repository.MonitoringPointData{},
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
	}
}

func (query MonitoringPointQuery) Get(mpId uint) (vo.MonitoringPoint, error) {
	mp, err := query.monitoringPointRepo.Get(context.TODO(), mpId)
	if err != nil {
		return vo.MonitoringPoint{}, err
	}

	return query.newMonitoringPoint(mp), nil
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

func (query MonitoringPointQuery) newMonitoringPoint(mp entity.MonitoringPoint) vo.MonitoringPoint {
	result := vo.NewMonitoringPoint(mp)

	if t := monitoringpointtype.Get(mp.Type); t != nil {
		result.Properties = make(vo.MPProperties, 0)
		for _, property := range t.Properties() {
			result.Properties = append(result.Properties, vo.NewMonitoringPointProperty(property))
		}
		sort.Sort(result.Properties)

		if data, err := query.monitoringPointDataRepo.Last(mp.ID, monitoringpointtype.MonitoringPointCategoryBasic); err == nil {
			if !data.Time.IsZero() {
				monitoringPointData := vo.NewMonitoringPointData(data.Time)
				values := map[string]interface{}{}
				for _, property := range result.Properties {
					for _, field := range property.Fields {
						values[field.Key] = data.Values[field.Key]
					}
				}
				monitoringPointData.Values = values
				result.Data = &monitoringPointData
			}
		}

		result.BindingDevices = make([]*vo.Device, 0)
		if bindings, err := query.monitoringPointDeviceBindingRepo.FindBySpecs(context.TODO(), spec.MonitoringPointIDEqSpec(mp.ID)); err == nil {
			for _, b := range bindings {
				dq := NewDeviceQuery()
				dev, err := dq.Get(b.DeviceID)
				if err == nil {
					result.BindingDevices = append(result.BindingDevices, dev)
				}
			}
		}
	}

	return result
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
		data, err := query.monitoringPointDataRepo.Find(mp.ID, monitoringpointtype.MonitoringPointCategoryBasic, from, to)
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

func (query MonitoringPointQuery) FindMonitoringPointRawDataByID(id uint, from, to time.Time) ([]vo.MonitoringPointData, error) {
	times, err := query.monitoringPointDataRepo.FindTimes(id, monitoringpointtype.MonitoringPointCategoryRaw, from, to)
	if err != nil {
		return nil, err
	}

	result := make(vo.MonitoringPointDataList, len(times))
	for i, t := range times {
		result[i] = vo.NewMonitoringPointData(t)
	}

	sort.Sort(result)
	return result, nil
}

func (query MonitoringPointQuery) GetDataByIDAndTimestamp(id uint, category uint, timestamp time.Time, filters request.Filters) (*vo.MonitoringPointData, error) {
	_, err := query.monitoringPointRepo.Get(context.TODO(), id)

	if err != nil {
		return nil, response.BusinessErr(errcode.MonitoringPointNotFoundError, err.Error())
	}

	data, err := query.monitoringPointDataRepo.Get(id, category, timestamp)
	if err != nil {
		return nil, err
	}

	result := vo.NewMonitoringPointData(data.Time)

	switch data.SensorType {
	case devicetype.KxSensor:
		var e entity.SvtRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		axis := entity.AxisSensorData{}
		switch cast.ToInt(filters["dimension"]) {
		case 0:
			axis = e.XAxis
		case 1:
			axis = e.YAxis
		case 2:
			axis = e.ZAxis
		default:
			axis = e.YAxis
		}
		result.Values = getKxSensorData(axis, cast.ToString(filters["calculate"]))
	case devicetype.DynamicLengthAttitudeSensor:
		var e entity.SasRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		result.Values = e
	case devicetype.DynamicSCL3300Sensor:
		var e entity.SqRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		result.Values = e
	}

	return &result, nil
}
