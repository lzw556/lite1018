package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type AngleDipStrategy struct {
	strategy
	variables []measurementtype.Variable
}

func NewAngleDipStrategy() Strategy {
	return &AngleDipStrategy{
		strategy:  newStrategy(),
		variables: measurementtype.Variables[measurementtype.AngleDip],
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
	for _, variable := range s.variables {
		switch variable.Type {
		case measurementtype.ArrayVariableType:
			result.Fields[variable.Name] = data.Values[variable.DataIndex:3]
		default:
			result.Fields[variable.Name] = data.Values[variable.DataIndex]
		}
	}
	return result, nil
}
