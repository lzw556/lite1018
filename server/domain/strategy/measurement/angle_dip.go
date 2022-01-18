package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type AngleDipStrategy struct {
	strategy
	Type measurementtype.AngleDip
}

func NewAngleDipStrategy() Strategy {
	return &AngleDipStrategy{
		strategy: newStrategy(),
		Type:     measurementtype.AngleDip{},
	}
}

func (s AngleDipStrategy) Do(m po.Measurement) (entity.MeasurementData, error) {
	data, err := s.getLastSensorData(m)
	if err != nil {
		return entity.MeasurementData{}, err
	}
	result := entity.MeasurementData{
		MeasurementID: m.ID,
		Time:          data.Time,
		Fields:        map[string]interface{}{},
	}
	result.Fields = s.Type.Variables().Convert(func(variable measurementtype.Variable) interface{} {
		if variable.Type == measurementtype.FloatVariableType {
			return data.Values[variable.DataIndex]
		}
		return nil
	})
	return result, nil
}
