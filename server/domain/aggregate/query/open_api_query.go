package query

import (
	"context"
	"encoding/json"
	"time"

	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/openapivo"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

type OpenApiQuery struct {
	entity.Project

	deviceRepo              dependency.DeviceRepository
	deviceInformationRepo   dependency.DeviceInformationRepository
	deviceStateRepo         dependency.DeviceStateRepository
	sensorDataRepo          dependency.SensorDataRepository
	networkRepo             dependency.NetworkRepository
	assetRepo               dependency.AssetRepository
	monitoringPointRepo     dependency.MonitoringPointRepository
	monitoringPointDataRepo dependency.MonitoringPointDataRepository
}

func NewOpenApiQuery() OpenApiQuery {
	return OpenApiQuery{
		deviceRepo:              repository.Device{},
		deviceInformationRepo:   repository.DeviceInformation{},
		deviceStateRepo:         repository.DeviceState{},
		sensorDataRepo:          repository.SensorData{},
		networkRepo:             repository.Network{},
		assetRepo:               repository.Asset{},
		monitoringPointRepo:     repository.MonitoringPoint{},
		monitoringPointDataRepo: repository.MonitoringPointData{},
	}
}

func (query OpenApiQuery) FindDevices() []openapivo.Device {
	ctx := context.Background()
	devices, err := query.deviceRepo.FindBySpecs(ctx, spec.ProjectEqSpec(query.Project.ID))
	if err != nil {
		return []openapivo.Device{}
	}
	networks := make(map[uint]entity.Network)
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
		if _, ok := networks[device.NetworkID]; !ok {
			if network, err := query.networkRepo.Get(ctx, device.NetworkID); err == nil {
				networks[network.ID] = network
			}
		}
		if network, ok := networks[device.NetworkID]; ok {
			r.Network = network.Name
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
	if network, err := query.networkRepo.Get(ctx, device.NetworkID); err == nil {
		result.Network = network.Name
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

func (query OpenApiQuery) FindAssets() ([]openapivo.Asset, error) {
	assetQuery := NewAssetQuery()
	assetQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	assets, err := assetQuery.List()
	if err != nil {
		return nil, err
	}

	var result []openapivo.Asset
	str, _ := json.Marshal(assets)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (query OpenApiQuery) GetAsset(assetId uint) (*openapivo.Asset, error) {
	assetQuery := NewAssetQuery()
	assetQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	asset, err := assetQuery.Get(assetId)
	if err != nil {
		return nil, response.ErrOpenApiAssetNotFound()
	}

	var result openapivo.Asset
	str, _ := json.Marshal(asset)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (query OpenApiQuery) FindMonitoringPoints(filters request.Filters) ([]openapivo.MonitoringPoint, error) {
	mpQuery := NewMonitoringPointQuery()
	mpQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}
	for name, v := range filters {
		switch name {
		case "type":
			mpQuery.Specs = append(mpQuery.Specs, spec.TypeEqSpec(cast.ToUint(v)))
		case "asset_id":
			mpQuery.Specs = append(mpQuery.Specs, spec.AssetEqSpec(cast.ToUint(v)))
		}
	}

	mps, err := mpQuery.List()
	if err != nil {
		return nil, err
	}

	var result []openapivo.MonitoringPoint
	str, _ := json.Marshal(mps)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (query OpenApiQuery) GetMonitoringPoint(mpID uint) (*openapivo.MonitoringPoint, error) {
	mpQuery := NewMonitoringPointQuery()
	mpQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	mp, err := mpQuery.Get(mpID)
	if err != nil {
		return nil, response.ErrOpenApiMonitoringPointNotFound()
	}

	var result openapivo.MonitoringPoint
	str, _ := json.Marshal(mp)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (query OpenApiQuery) FindMonitoringPointData(mpID uint, property string, from, to int64) ([]openapivo.MonitoringPointData, error) {
	ctx := context.Background()
	mp, err := query.monitoringPointRepo.GetBySpecs(ctx, spec.IDEqSpec(mpID), spec.ProjectEqSpec(query.Project.ID))
	if err != nil {
		return nil, response.ErrOpenApiMonitoringPointNotFound()
	}
	result := make([]openapivo.MonitoringPointData, 0)
	if t := monitoringpointtype.Get(mp.Type); t != nil {
		data, err := query.monitoringPointDataRepo.Find(mpID, monitoringpointtype.MonitoringPointCategoryBasic, time.Unix(from, 0), time.Unix(to, 0))
		if err != nil {
			return nil, err
		}
		for _, d := range data {
			r := openapivo.MonitoringPointData{
				Timestamp: d.Time.Unix(),
				Values:    map[string]interface{}{},
			}
			for _, prop := range t.Properties() {
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

func (query OpenApiQuery) FindAlarmRuleGroups() ([]openapivo.AlarmRuleGroup, error) {
	agQuery := NewAlarmRuleGroupQuery()
	agQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	groups, err := agQuery.List()
	if err != nil {
		return nil, err
	}

	var result []openapivo.AlarmRuleGroup
	str, _ := json.Marshal(groups)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (query OpenApiQuery) GetAlarmRuleGroup(gID uint) (*openapivo.AlarmRuleGroup, error) {
	agQuery := NewAlarmRuleGroupQuery()
	agQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	group, err := agQuery.Get(gID)
	if err != nil {
		return nil, err
	}

	var result openapivo.AlarmRuleGroup
	str, _ := json.Marshal(group)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (query OpenApiQuery) FindAlarmRecords(page int, size int, from int64, to int64) ([]openapivo.AlarmRecord, int64, error) {
	arQuery := NewAlarmRecordQuery()
	arQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	records, total, err := arQuery.Paging(page, size, time.Unix(from, 0), time.Unix(to, 0))
	if err != nil {
		return nil, 0, err
	}

	var result []openapivo.AlarmRecord
	str, _ := json.Marshal(records)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (query OpenApiQuery) FindNetworks() ([]openapivo.Network, error) {
	netQuery := NewNetworkQuery()
	netQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	nets, err := netQuery.List()
	if err != nil {
		return nil, err
	}

	var result []openapivo.Network
	str, _ := json.Marshal(nets)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (query OpenApiQuery) GetNetwork(id uint) (*openapivo.NetworkDetail, error) {
	netQuery := NewNetworkQuery()
	netQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	net, err := netQuery.Get(id)
	if err != nil {
		return nil, err
	}

	var result openapivo.NetworkDetail
	str, _ := json.Marshal(net)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (query OpenApiQuery) GetAllStatistics() (*openapivo.AllStatistics, error) {
	statQuery := NewStatisticQuery()
	statQuery.Specs = []spec.Specification{spec.ProjectEqSpec(query.Project.ID)}

	stat, err := statQuery.GetAllStatistics()
	if err != nil {
		return nil, err
	}

	var result openapivo.AllStatistics
	str, _ := json.Marshal(stat)
	if err := json.Unmarshal(str, &result); err != nil {
		return nil, err
	}

	return &result, nil
}
