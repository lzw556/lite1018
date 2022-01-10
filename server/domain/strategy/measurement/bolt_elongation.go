package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type BoltElongationStrategy struct {
	strategy
	Type measurementtype.BoltElongation
}

func NewBoltElongationStrategy() Strategy {
	return &BoltElongationStrategy{
		strategy: newStrategy(),
		Type:     measurementtype.BoltElongation{},
	}
}

func (s BoltElongationStrategy) Do(m po.Measurement) (entity.MeasurementData, error) {
	data, err := s.strategy.getLastSensorData(m)
	if err != nil {
		return entity.MeasurementData{}, err
	}
	result := entity.MeasurementData{
		MeasurementID: m.ID,
		Time:          data.Time,
		Fields:        map[string]interface{}{},
	}
	for _, variable := range s.Type.Variables() {
		result.Fields[variable.Name] = data.Values[variable.DataIndex]
	}
	return result, nil
}
