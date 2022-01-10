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
	monthAgo := data.Time.AddDate(0, -1, 0)
	monthAgoData, err := s.strategy.getSensorData(m, monthAgo)
	if err != nil {
		return entity.MeasurementData{}, err
	}
	result := entity.MeasurementData{
		Time:          data.Time,
		MeasurementID: m.ID,
		Fields:        map[string]interface{}{},
	}
	for _, v := range s.Type.Variables() {
		if v.Name == "corrosion_rate" {
			result.Fields[v.Name] = calculate.CorrosionRate(data.Values[v.DataIndex], monthAgoData.Values[v.DataIndex], data.Time.Sub(monthAgo).Seconds())
		} else {
			result.Fields[v.Name] = data.Values[v.DataIndex]
		}
	}
	return result, nil
}
