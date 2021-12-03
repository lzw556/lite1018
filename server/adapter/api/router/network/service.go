package network

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	GetNetwork(networkID uint) (*vo.Network, error)
	FindNetworks(assetID uint) ([]vo.Network, error)
	CreateNetwork(req request.ImportNetwork) error

	UpdateNetwork(networkID uint, req request.Network) (*vo.Network, error)
	RemoveNetwork(networkID uint) error
	UpdateSetting(gatewayID uint, req request.WSN) error

	ExportNetwork(networkID uint) (*vo.NetworkExportFile, error)
	SyncNetwork(networkID uint) error

	AccessDevices(networkID uint, req request.AccessDevices) error
	RemoveDevices(networkID uint, req request.RemoveDevices) error
}
