package process

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	specs "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	mptype "github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

func ProcessPlainData(mp entity.MonitoringPoint, sensorData entity.SensorData) entity.MonitoringPointData {
	mpData := entity.MonitoringPointData{
		Time:              sensorData.Time,
		MonitoringPointID: mp.ID,
		MacAddress:        sensorData.MacAddress,
		Category:          mptype.MonitoringPointCategoryBasic,
		SensorType:        sensorData.SensorType,
		Values:            map[string]interface{}{},
	}

	t := mptype.Get(mp.Type)
	if t != nil {
		for _, prop := range t.Properties() {
			for _, field := range prop.Fields {
				if v, ok := sensorData.Values[field.Key]; ok {
					//修复嵌入式应力计算bug
					if field.Key == "pressure" {
						var err error
						if preloadVal, ok := sensorData.Values["preload"]; ok {
							devRepo := repository.Device{}
							dev, err := devRepo.GetBySpecs(context.TODO(), specs.DeviceMacEqSpec(sensorData.MacAddress))
							if err == nil {
								devQuery := query.NewDeviceQuery()
								devSettings, err := devQuery.GetSettings(dev.ID)
								if err == nil {
									err = fmt.Errorf("sectional_area is invalid.")
								LOOP:
									for _, setting := range devSettings {
										if setting.Key == "preload_is_enabled" {
											for _, setting := range setting.Children {
												if setting.Key == "sectional_area" {
													mpData.Values[field.Key] = preloadVal.(float32) * 1000 / setting.Value.(float32)
													err = nil
													break LOOP
												}
											}
										}
									}
								} else {
									err = fmt.Errorf("Failed to get device %d settings.", dev.ID)
								}
							} else {
								err = fmt.Errorf("Device %s is not found.", sensorData.MacAddress)
							}
						} else {
							err = fmt.Errorf("preload is invalid.")
						}

						if err != nil {
							fmt.Printf("Error = %s, using device pressure\n", err.Error())
							mpData.Values[field.Key] = v
						}
					} else {
						mpData.Values[field.Key] = v
					}
				}
			}
		}
	}

	return mpData
}

func ProcessPlainRawData(mp entity.MonitoringPoint, sensorData entity.SensorData) entity.MonitoringPointData {
	mpData := entity.MonitoringPointData{
		Time:              sensorData.Time,
		MonitoringPointID: mp.ID,
		MacAddress:        sensorData.MacAddress,
		Category:          mptype.MonitoringPointCategoryRaw,
		SensorType:        sensorData.SensorType,
		Values:            sensorData.Values,
	}

	return mpData
}
