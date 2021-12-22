package measurement

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"time"
)

type BoltLooseningStrategy struct {
	po.Measurement

	binding    dependency.MeasurementDeviceBindingRepository
	device     dependency.DeviceRepository
	deviceData dependency.DeviceDataRepository
}

func NewBoltLooseningStrategy(e po.Measurement) Strategy {
	return &BoltLooseningStrategy{
		Measurement: e,
		binding:     repository.MeasurementDeviceBinding{},
		device:      repository.Device{},
		deviceData:  repository.DeviceData{},
	}
}

func (s BoltLooseningStrategy) Do(m po.Measurement) (po.MeasurementData, error) {
	ctx := context.TODO()
	binding, err := s.binding.GetBySpecs(ctx, spec.MeasurementEqSpec(m.ID))
	if err != nil {
		return po.MeasurementData{}, err
	}
	data, err := s.deviceData.Last(binding.MacAddress)
	if err != nil {
		return po.MeasurementData{}, err
	}
	if inPeriod(data.Time, cast.ToDuration(m.SamplePeriod)*time.Millisecond*3) {
		result := po.MeasurementData{
			MeasurementID: m.ID,
			Time:          data.Time,
			Fields:        map[string]interface{}{},
		}
		if variables, ok := measurementtype.Variables[m.Type]; ok {
			for _, variable := range variables {
				result.Fields[variable.Name] = data.Values[variable.Index]
			}
			return result, nil
		}
		return po.MeasurementData{}, fmt.Errorf("not config variable by measurement type: %v", m.Type)
	} else {

	}
	return po.MeasurementData{}, fmt.Errorf("no schedule0_sample_period in settings")
}
