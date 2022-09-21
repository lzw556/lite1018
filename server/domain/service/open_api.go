package service

import (
	"context"

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
