package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type NormalTemperatureCorrosionStrategy struct {
	strategy
	Type measurementtype.NormalTemperatureCorrosion
}

func NewNormalTemperatureCorrosionStrategy() Strategy {
	return &NormalTemperatureCorrosionStrategy{
		strategy: newStrategy(),
		Type:     measurementtype.NormalTemperatureCorrosion{},
	}
}

func (s NormalTemperatureCorrosionStrategy) Do(m po.Measurement) (entity.MeasurementData, error) {
	data, err := s.strategy.getLastSensorData(m)
	if err != nil {
		return entity.MeasurementData{}, err
	}
	result := entity.MeasurementData{
		Time:          data.Time,
		MeasurementID: m.ID,
		Fields:        map[string]interface{}{},
	}
	result.Fields = s.Type.Variables().Convert(func(variable measurementtype.Variable) interface{} {
		if variable.Type == measurementtype.FloatVariableType {
			if variable.Name == "corrosion_rate" {
				monthAgo := data.Time.AddDate(0, -1, 0)
				if monthAgoData, err := s.strategy.getSensorData(m, monthAgo); err == nil {
					return calculate.CorrosionRate(data.Values[variable.DataIndex], monthAgoData.Values[variable.DataIndex], data.Time.Sub(monthAgo).Seconds())
				}
			} else {
				return data.Values[variable.DataIndex]
			}
		}
		return nil
	})
	return result, nil
}
