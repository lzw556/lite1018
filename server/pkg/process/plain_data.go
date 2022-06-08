package process

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	mptype "github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

func ProcessPlainData(mp entity.MonitoringPoint, sensorData entity.SensorData) entity.MonitoringPointData {
	mpData := entity.MonitoringPointData{
		Time:              sensorData.Time,
		MonitoringPointID: mp.ID,
		MacAddress:        sensorData.MacAddress,
		Category:          mptype.MonitoringPointCategoryBasic,
		Values:            map[string]interface{}{},
	}

	t := mptype.Get(mp.Type)
	if t != nil {
		for _, prop := range t.Properties() {
			for _, field := range prop.Fields {
				if v, ok := sensorData.Values[field.Key]; ok {
					mpData.Values[field.Key] = v
				}
			}
		}
	}

	return mpData
}
