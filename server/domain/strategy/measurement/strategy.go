package measurement

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"time"
)

type Strategy interface {
	Do(m po.Measurement) (entity.MeasurementData, error)
}

func inPeriod(last time.Time, period time.Duration) bool {
	return time.Now().Sub(last).Seconds() <= period.Seconds()
}

type strategy struct {
	binding    dependency.MeasurementDeviceBindingRepository
	device     dependency.DeviceRepository
	sensorData dependency.SensorDataRepository
}

func newStrategy() strategy {
	return strategy{
		binding:    repository.MeasurementDeviceBinding{},
		device:     repository.Device{},
		sensorData: repository.SensorData{},
	}
}

func (s strategy) getLastSensorData(m po.Measurement) (entity.SensorData, error) {
	ctx := context.TODO()
	binding, err := s.binding.GetBySpecs(ctx, spec.MeasurementEqSpec(m.ID))
	if err != nil {
		return entity.SensorData{}, err
	}
	data, err := s.sensorData.Last(binding.MacAddress)
	if err != nil {
		return entity.SensorData{}, err
	}
	if len(data.Values) == 0 {
		return entity.SensorData{}, fmt.Errorf("no data for device [%s], measurement => [%s]", binding.MacAddress, m.Name)
	}
	return data, nil
}

func (s strategy) getSensorData(m po.Measurement, time time.Time) (entity.SensorData, error) {
	ctx := context.TODO()
	binding, err := s.binding.GetBySpecs(ctx, spec.MeasurementEqSpec(m.ID))
	if err != nil {
		return entity.SensorData{}, err
	}
	data, err := s.sensorData.Get(binding.MacAddress, time)
	if err != nil {
		return entity.SensorData{}, err
	}
	return data, nil
}
