package factory

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"time"
)

type Statistic struct {
	measurementRepo dependency.MeasurementRepository
	deviceRepo      dependency.DeviceRepository
	bindingRepo     dependency.MeasurementDeviceBindingRepository
	alarmRecordRepo dependency.AlarmRecordRepository
}

func NewStatistic() Statistic {
	return Statistic{
		measurementRepo: repository.Measurement{},
		deviceRepo:      repository.Device{},
		bindingRepo:     repository.MeasurementDeviceBinding{},
		alarmRecordRepo: repository.AlarmRecord{},
	}
}

func (factory Statistic) NewStatisticalMeasurementsQuery(filters request.Filters) (*query.StatisticalMeasurementsQuery, error) {
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			specs = append(specs, spec.AssetEqSpec(cast.ToUint(filter.Value)))
		case "measurement_id":
			specs = append(specs, spec.PrimaryKeyInSpec{cast.ToUint(filter.Value)})
		}
	}
	es, err := factory.measurementRepo.FindBySpecs(context.TODO(), specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewStatisticalMeasurementsQuery()
	q.Measurements = es
	return &q, nil
}

func (factory Statistic) NewStatisticalMeasurementDataQuery(id uint) (*query.StatisticalMeasurementDataQuery, error) {
	ctx := context.TODO()
	e, err := factory.measurementRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.MeasurementNotFoundError, "")
	}
	q := query.NewStatisticalMeasurementDataQuery()
	q.Measurement = e
	return &q, nil
}

func (factory Statistic) NewStatisticalDevicesQuery(filters request.Filters) (*query.StatisticalDevicesQuery, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "asset_id":
			if measurements, err := factory.measurementRepo.FindBySpecs(ctx, spec.AssetEqSpec(cast.ToUint(filter.Value))); err == nil {
				measurementInSpec := make(spec.MeasurementInSpec, len(measurements))
				for i, measurement := range measurements {
					measurementInSpec[i] = measurement.ID
				}
				if bindings, err := factory.bindingRepo.FindBySpecs(ctx, measurementInSpec); err == nil {
					macInSpec := make(spec.DeviceMacInSpec, len(bindings))
					for i, binding := range bindings {
						macInSpec[i] = binding.MacAddress
					}
					specs = append(specs, macInSpec)
				}
			}
		case "measurement_id":
			if bindings, err := factory.bindingRepo.FindBySpecs(ctx, spec.MeasurementEqSpec(cast.ToUint(filter.Value))); err == nil {
				macInSpec := make(spec.DeviceMacInSpec, len(bindings))
				for i, binding := range bindings {
					macInSpec[i] = binding.MacAddress
				}
				specs = append(specs, macInSpec)
			}
		}
	}
	es, err := factory.deviceRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewStatisticalDevicesQuery()
	q.Devices = es
	return &q, nil
}

func (factory Statistic) NewStatisticalAlarmRecordsQuery(from, to int64, filters request.Filters) (*query.StatisticalAlarmRecordsQuery, error) {
	ctx := context.TODO()
	specs := make([]spec.Specification, 0)
	for _, filter := range filters {
		switch filter.Name {
		case "measurement_id":
			specs = append(specs, spec.MeasurementEqSpec(cast.ToUint(filter.Value)))
		case "asset_id":
			if measurements, err := factory.measurementRepo.FindBySpecs(context.TODO(), spec.AssetEqSpec(cast.ToUint(filter.Value))); err == nil {
				measurementsSpec := make(spec.MeasurementInSpec, len(measurements))
				for i, measurement := range measurements {
					measurementsSpec[i] = measurement.ID
				}
				specs = append(specs, measurementsSpec)
			}
		}
	}
	begin := time.Unix(from, 0)
	end := time.Unix(to, 0)
	specs = append(specs, spec.CreatedAtRangeSpec{begin, end})
	es, err := factory.alarmRecordRepo.FindBySpecs(ctx, specs...)
	if err != nil {
		return nil, err
	}
	q := query.NewStatisticalAlarmRecordsQuery()
	q.AlarmRecords = es
	days := int(time.Unix(to, 0).Sub(time.Unix(from, 0)).Hours()) / 24
	q.Times = []time.Time{begin}
	for i := 0; i < days; i++ {
		q.Times = append(q.Times, q.Times[i].Add(24*time.Hour))
	}
	return &q, nil
}

func (factory Statistic) NewStatisticalMeasurementAlertQuery(id uint) (*query.StatisticalMeasurementAlertQuery, error) {
	ctx := context.TODO()
	e, err := factory.measurementRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.MeasurementNotFoundError, "")
	}
	q := query.NewStatisticalMeasurementAlertQuery()
	q.Measurement = e
	return &q, nil
}
