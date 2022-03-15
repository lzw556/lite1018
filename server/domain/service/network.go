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

func (s Network) ImportNetwork(req request.ImportNetwork) error {
	cmd, err := s.factory.NewNetworkImportCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Network) CreateNetwork(req request.CreateNetwork) error {
	cmd, err := s.factory.NewNetworkCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Network) ExportNetworkByID(networkID uint) (*vo.NetworkExportFile, error) {
	cmd, err := s.factory.NewNetworkExportCmd(networkID)
	if err != nil {
		return nil, err
	}
	return cmd.Run(), nil
}

func (s Network) GetNetworkByID(networkID uint) (*vo.Network, error) {
	query := s.factory.NewNetworkQuery(nil)
	return query.Get(networkID)
}

func (s Network) FindNetworksByPaginate(filters request.Filters, page, size int) ([]vo.Network, int64, error) {
	query := s.factory.NewNetworkQuery(filters)
	return query.Paging(page, size)
}

func (s Network) FindNetworks(filters request.Filters) ([]vo.Network, error) {
	query := s.factory.NewNetworkQuery(filters)
	return query.List()
}

func (s Network) AddDevicesByID(networkID uint, req request.AddDevices) error {
	cmd, err := s.factory.NewNetworkUpdateCmdByID(networkID)
	if err != nil {
		return err
	}
	if req.IsNew {
		return cmd.AddNewDevices(req)
	}
	return cmd.AddDevices(req.ParentID, req.Devices)
}

func (s Network) RemoveDevicesByID(networkID uint, req request.RemoveDevices) error {
	cmd, err := s.factory.NewNetworkUpdateCmdByID(networkID)
	if err != nil {
		return err
	}
	return cmd.RemoveDevices(req)
}

func (s Network) UpdateNetworkByID(networkID uint, req request.Network) (*vo.Network, error) {
	cmd, err := s.factory.NewNetworkUpdateCmd(networkID)
	if err != nil {
		return nil, err
	}
	return cmd.Update(req)
}

func (s Network) DeleteNetworkByID(networkID uint) error {
	cmd, err := s.factory.NewNetworkRemoveCmd(networkID)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Network) SyncNetworkByID(networkID uint) error {
	cmd, err := s.factory.NewNetworkSyncCmd(networkID)
	if err != nil {
		return err
	}
	return cmd.Run()
}
