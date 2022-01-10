package network

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	GetNetworkByID(id uint) (*vo.Network, error)
	FindNetworksByPaginate(filters request.Filters, page, size int) ([]vo.Network, int64, error)
	ImportNetwork(req request.ImportNetwork) error
	CreateNetwork(req request.CreateNetwork) error

	UpdateNetworkByID(id uint, req request.Network) (*vo.Network, error)
	DeleteNetworkByID(id uint) error
	UpdateSettingByGatewayID(gatewayID uint, req request.WSN) error

	ExportNetworkByID(id uint) (*vo.NetworkExportFile, error)
	SyncNetworkByID(id uint) error

	AddDevicesByID(id uint, req request.AddDevices) error
	RemoveDevicesByID(id uint, req request.RemoveDevices) error
}
