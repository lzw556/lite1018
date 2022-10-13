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
	FindAssets(ctx context.Context, projectID uint) ([]openapivo.Asset, error)
	GetAsset(ctx context.Context, projectID uint, id uint) (*openapivo.Asset, error)
	FindMonitoringPoints(ctx context.Context, projectID uint, filters request.Filters) ([]openapivo.MonitoringPoint, error)
	GetMonitoringPoint(ctx context.Context, projectID uint, id uint) (*openapivo.MonitoringPoint, error)
	FindMonitoringPointData(ctx context.Context, projectID uint, id uint, property string, from, to int64) ([]openapivo.MonitoringPointData, error)
	FindAlarmRuleGroups(ctx context.Context, projectID uint) ([]openapivo.AlarmRuleGroup, error)
	GetAlarmRuleGroup(ctx context.Context, projectID uint, id uint) (*openapivo.AlarmRuleGroup, error)
	FindAlarmRecords(ctx context.Context, projectID uint, page int, size int, from int64, to int64) ([]openapivo.AlarmRecord, int64, error)
	FindNetworks(ctx context.Context, projectID uint) ([]openapivo.Network, error)
	GetNetwork(ctx context.Context, projectID uint, id uint) (*openapivo.NetworkDetail, error)
	GetAllStatistics(ctx context.Context, projectID uint) (*openapivo.AllStatistics, error)
}
