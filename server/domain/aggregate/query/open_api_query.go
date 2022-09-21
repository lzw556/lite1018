package query

import (
	"context"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/openapivo"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
)

type OpenApiQuery struct {
	entity.Project

	deviceRepo            dependency.DeviceRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	deviceStateRepo       dependency.DeviceStateRepository
	sensorDataRepo        dependency.SensorDataRepository
}

func NewOpenApiQuery() OpenApiQuery {
	return OpenApiQuery{
		deviceRepo:            repository.Device{},
		deviceInformationRepo: repository.DeviceInformation{},
		deviceStateRepo:       repository.DeviceState{},
		sensorDataRepo:        repository.SensorData{},
	}
}

func (query OpenApiQuery) FindDevices() []openapivo.Device {
	ctx := context.Background()
	devices, err := query.deviceRepo.FindBySpecs(ctx, spec.ProjectEqSpec(query.Project.ID))
	if err != nil {
		return []openapivo.Device{}
	}
	result := make([]openapivo.Device, len(devices))
	for i, device := range devices {
		r := openapivo.NewDevice(device)
		r.IsOnline, r.ConnectedAt, _ = cache.GetConnection(device.MacAddress)
		if information, err := query.deviceInformationRepo.Get(device.MacAddress); err == nil {
			r.Information = openapivo.DeviceInformation{
				Model:           information.Model,
				FirmwareID:      information.ProductID,
				FirmwareVersion: information.FirmwareVersion,
				IPAddress:       information.IPAddress,
				Gateway:         information.Gateway,
				SubnetMask:      information.SubnetMask,
				IccID4G:         information.IccID4G,
			}
		}
		if state, err := query.deviceStateRepo.Get(device.MacAddress); err == nil {
			r.BatteryVoltage = state.BatteryVoltage
			r.SignalLevel = state.SignalLevel
		}
		result[i] = r
	}
	return result
}

func (query OpenApiQuery) GetDevice(mac string) (*openapivo.Device, error) {
	ctx := context.Background()
	device, err := query.deviceRepo.GetBySpecs(ctx, spec.ProjectEqSpec(query.Project.ID), spec.DeviceMacEqSpec(mac))
	if err != nil {
		return nil, response.ErrOpenApiDeviceNotFound()
	}
	result := openapivo.NewDevice(device)
	result.IsOnline, result.ConnectedAt, _ = cache.GetConnection(device.MacAddress)
	if information, err := query.deviceInformationRepo.Get(device.MacAddress); err == nil {
		result.Information = openapivo.DeviceInformation{
			Model:           information.Model,
			FirmwareID:      information.ProductID,
			FirmwareVersion: information.FirmwareVersion,
			IPAddress:       information.IPAddress,
			Gateway:         information.Gateway,
			SubnetMask:      information.SubnetMask,
			IccID4G:         information.IccID4G,
		}
	}
	if state, err := query.deviceStateRepo.Get(device.MacAddress); err == nil {
		result.BatteryVoltage = state.BatteryVoltage
		result.SignalLevel = state.SignalLevel
	}
	return &result, nil
}

func (query OpenApiQuery) FindDeviceData(mac, property string, from, to int64) ([]openapivo.DeviceData, error) {
	ctx := context.Background()
	device, err := query.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(mac), spec.ProjectEqSpec(query.Project.ID))
	if err != nil {
		return nil, response.ErrOpenApiDeviceNotFound()
	}
	result := make([]openapivo.DeviceData, 0)
	if t := devicetype.Get(device.Type); t != nil {
		data, err := query.sensorDataRepo.Find(device.MacAddress, t.SensorID(), time.Unix(from, 0), time.Unix(to, 0))
		if err != nil {
			return nil, err
		}
		for _, d := range data {
			r := openapivo.DeviceData{
				Timestamp: d.Time.Unix(),
				Values:    map[string]interface{}{},
			}
			for _, prop := range t.Properties(t.SensorID()) {
				for _, field := range prop.Fields {
					if len(property) > 0 {
						if property == field.Key {
							r.Values[field.Key] = d.Values[field.Key]
						}
					} else {
						r.Values[field.Key] = d.Values[field.Key]
					}
				}
			}
			result = append(result, r)
		}
	}
	return result, nil
}
