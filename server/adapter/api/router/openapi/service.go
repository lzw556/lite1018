package openapi

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/openapivo"
)

type Service interface {
	FindDevicesByProjectID(ctx context.Context, projectID uint) ([]openapivo.Device, error)
	GetDeviceByMac(ctx context.Context, mac string, projectID uint) (*openapivo.Device, error)
	FindDeviceDataByMac(ctx context.Context, projectID uint, mac string, property string, from, to int64) ([]openapivo.DeviceData, error)
	FindAssetsByProjectID(ctx context.Context, projectID uint) ([]openapivo.Asset, error)
	GetAsset(ctx context.Context, id uint, projectID uint) (*openapivo.Asset, error)
	FindMonitoringPointsByProjectID(ctx context.Context, projectID uint, filters request.Filters) ([]openapivo.MonitoringPoint, error)
	GetMonitoringPoint(ctx context.Context, id uint, projectID uint) (*openapivo.MonitoringPoint, error)
}
