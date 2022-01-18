package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type BoltLooseningStrategy struct {
	strategy
	Type measurementtype.BoltLoosening
}

func NewBoltLooseningStrategy() Strategy {
	return &BoltLooseningStrategy{
		strategy: newStrategy(),
		Type:     measurementtype.BoltLoosening{},
	}
}

func (s BoltLooseningStrategy) Do(m po.Measurement) (entity.MeasurementData, error) {
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
