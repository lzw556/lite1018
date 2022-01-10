package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type BoltLooseningStrategy struct {
	strategy
	variables []measurementtype.Variable
}

func NewBoltLooseningStrategy() Strategy {
	return &BoltLooseningStrategy{
		strategy:  newStrategy(),
		variables: measurementtype.Variables[measurementtype.BoltLoosening],
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
	for _, variable := range s.variables {
		result.Fields[variable.Name] = data.Values[variable.DataIndex]
	}
	return result, nil
}
