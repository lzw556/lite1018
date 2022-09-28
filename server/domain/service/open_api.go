package service

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/openapi"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/openapivo"
)

type OpenApi struct {
	factory factory.OpenApi
}

func NewOpenApi() openapi.Service {
	return &OpenApi{
		factory: factory.NewOpenApi(),
	}
}

func (s *OpenApi) FindDevicesByProjectID(ctx context.Context, projectID uint) ([]openapivo.Device, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}
	return query.FindDevices(), nil
}

func (s *OpenApi) GetDeviceByMac(ctx context.Context, mac string, projectID uint) (*openapivo.Device, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}
	return query.GetDevice(mac)
}

func (s *OpenApi) FindDeviceDataByMac(ctx context.Context, projectID uint, mac string, property string, from int64, to int64) ([]openapivo.DeviceData, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}
	return query.FindDeviceData(mac, property, from, to)
}

func (s *OpenApi) FindAssets(ctx context.Context, projectID uint) ([]openapivo.Asset, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.FindAssets()
}

func (s *OpenApi) GetAsset(ctx context.Context, projectID uint, id uint) (*openapivo.Asset, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.GetAsset(id)
}

func (s *OpenApi) FindMonitoringPoints(ctx context.Context, projectID uint, filters request.Filters) ([]openapivo.MonitoringPoint, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.FindMonitoringPoints(filters)
}

func (s *OpenApi) GetMonitoringPoint(ctx context.Context, id uint, projectID uint) (*openapivo.MonitoringPoint, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.GetMonitoringPoint(id)
}

func (s *OpenApi) FindMonitoringPointData(ctx context.Context, projectID uint, id uint, property string, from int64, to int64) ([]openapivo.MonitoringPointData, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}
	return query.FindMonitoringPointData(id, property, from, to)
}

func (s *OpenApi) FindAlarmRuleGroups(ctx context.Context, projectID uint) ([]openapivo.AlarmRuleGroup, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.FindAlarmRuleGroups()
}

func (s *OpenApi) GetAlarmRuleGroup(ctx context.Context, projectID uint, id uint) (*openapivo.AlarmRuleGroup, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.GetAlarmRuleGroup(id)
}

func (s *OpenApi) FindAlarmRecords(ctx context.Context, projectID uint, page int, size int, from int64, to int64) ([]openapivo.AlarmRecord, int64, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, 0, err
	}

	return query.FindAlarmRecords(page, size, from, to)
}

func (s *OpenApi) FindNetworks(ctx context.Context, projectID uint) ([]openapivo.Network, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.FindNetworks()
}

func (s *OpenApi) GetNetwork(ctx context.Context, projectID uint, id uint) (*openapivo.NetworkDetail, error) {
	query, err := s.factory.NewOpenApiQuery(projectID)
	if err != nil {
		return nil, err
	}

	return query.GetNetwork(id)
}
