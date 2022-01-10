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
		dataSlice := make([]float64, 0)
		for _, binding := range bindings {
			if data, err := s.strategy.sensorData.Last(binding.MacAddress); err == nil {
				dataSlice = append(dataSlice, cast.ToFloat64(data.Values[5]))
			}
		}
		// 法兰预紧力算法
		preloads := calculate.FlangeBoltPreloads(cast.ToInt(numOfBolts), len(bindings), 0, dataSlice)
		return entity.MeasurementData{
			Time: time.Now().UTC(),
			Fields: map[string]interface{}{
				"preload": preloads,
			},
			MeasurementID: m.ID,
		}, nil
	}
	return entity.MeasurementData{}, fmt.Errorf("number_of_bolts not found")
}
