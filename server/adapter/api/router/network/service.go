package network

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	GetNetwork(networkID uint) (*vo.Network, error)
	FindNetworks(assetID uint) ([]vo.Network, error)
	CreateNetwork(req request.ImportNetwork) error

	UpdateSetting(gatewayID uint, req request.WSN) error

	ExportNetwork(networkID uint) (*vo.NetworkExportFile, error)

	AccessDevices(networkID uint, req request.AccessDevices) error
	RemoveDevice(networkID, deviceID uint) (*vo.Network, error)
}
