package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/network"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Network struct {
	repository dependency.NetworkRepository
	factory    factory.Network
}

func NewNetwork() network.Service {
	return Network{
		repository: repository.Network{},
		factory:    factory.NewNetwork(),
	}
}

func (s Network) CreateNetwork(req request.ImportNetwork) error {
	cmd, err := s.factory.NewNetworkCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Network) ExportNetwork(networkID uint) (*vo.NetworkExportFile, error) {
	cmd, err := s.factory.NewNetworkExportCmd(networkID)
	if err != nil {
		return nil, err
	}
	return cmd.Run(), nil
}

func (s Network) GetNetwork(networkID uint) (*vo.Network, error) {
	query, err := s.factory.NewNetworkQuery(networkID)
	if err != nil {
		return nil, err
	}
	return query.Detail()
}

func (s Network) FindNetworks(assetID uint) ([]vo.Network, error) {
	query, err := s.factory.NewNetworksQuery(assetID)
	if err != nil {
		return nil, err
	}
	return query.List(), nil
}

func (s Network) AccessDevices(networkID uint, req request.AccessDevices) error {
	cmd, err := s.factory.NewNetworkAccessDevicesCmd(networkID, req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Network) RemoveDevice(networkID, deviceID uint) (*vo.Network, error) {
	cmd, err := s.factory.NewNetworkRemoveDeviceCmd(networkID, deviceID)
	if err != nil {
		return nil, err
	}
	return cmd.Run()
}

func (s Network) UpdateSetting(gatewayID uint, req request.WSN) error {
	cmd, err := s.factory.NewNetworkUpdateCmd(gatewayID)
	if err != nil {
		return err
	}
	return cmd.UpdateSetting(req)
}
