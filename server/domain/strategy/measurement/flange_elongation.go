package measurement

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"sort"
	"time"
)

type FlangeElongationStrategy struct {
	strategy
	Type measurementtype.FlangeElongation
}

func NewFlangeElongationStrategy() Strategy {
	return &FlangeElongationStrategy{
		strategy: newStrategy(),
		Type:     measurementtype.FlangeElongation{},
	}
}

func (s FlangeElongationStrategy) Do(m po.Measurement) (entity.MeasurementData, error) {
	if numOfBolts, ok := m.Settings["number_of_bolts"]; ok {
		ctx := context.TODO()
		bindings, err := s.strategy.binding.FindBySpecs(ctx, spec.MeasurementEqSpec(m.ID))
		if err != nil {
			return entity.MeasurementData{}, err
		}
		sort.Sort(bindings)
		result := entity.MeasurementData{
			Time:          time.Now().UTC(),
			Fields:        map[string]interface{}{},
			MeasurementID: m.ID,
			Metadata: map[string]interface{}{
				"number_of_bolts":  numOfBolts,
				"offset_of_angle":  cast.ToInt(m.Settings["offset_of_angle"]),
				"measurement_type": m.Type,
			},
		}
		result.Fields = s.Type.Variables().Convert(func(variable measurementtype.Variable) interface{} {
			switch variable.Type {
			case measurementtype.ArrayVariableType:
				// 法兰预紧力算法
				dataSlice := make([]float64, 0)
				for _, binding := range bindings {
					if data, err := s.strategy.sensorData.Last(binding.MacAddress); err == nil {
						dataSlice = append(dataSlice, cast.ToFloat64(data.Values[variable.DataIndex]))
					}
				}
				return calculate.FlangeBoltPreloads(cast.ToInt(numOfBolts), len(bindings), 0, dataSlice)
			}
			return nil
		})
		fmt.Println(result)
		return result, nil
	}
	return entity.MeasurementData{}, fmt.Errorf("number_of_bolts not found")
}
