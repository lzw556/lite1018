package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type NetworkQuery struct {
	Specs []spec.Specification

	networkRepo               dependency.NetworkRepository
	deviceRepo                dependency.DeviceRepository
	deviceStateRepo           dependency.DeviceStateRepository
	deviceInformationRepo     dependency.DeviceInformationRepository
	deviceConnectionStateRepo dependency.DeviceConnectionStateRepository
}

func NewNetworkQuery() NetworkQuery {
	return NetworkQuery{
		networkRepo:               repository.Network{},
		deviceRepo:                repository.Device{},
		deviceStateRepo:           repository.DeviceState{},
		deviceInformationRepo:     repository.DeviceInformation{},
		deviceConnectionStateRepo: repository.DeviceConnectionState{},
	}
}

func (query NetworkQuery) check(id uint) (entity.Network, error) {
	e, err := query.networkRepo.Get(context.TODO(), id)
	if err != nil {
		return entity.Network{}, response.BusinessErr(errcode.NetworkNotFoundError, err.Error())
	}
	return e, nil
}

func (query NetworkQuery) setDeviceState(device *vo.Device) {
	if state, err := query.deviceStateRepo.Get(device.MacAddress); err == nil {
		device.SetState(state)
	}
	if connectionState, err := query.deviceConnectionStateRepo.Get(device.MacAddress); err == nil {
		if connectionState == nil {
			connectionState = entity.NewDeviceConnectionState()
		}
		device.State.IsOnline = connectionState.IsOnline()
		device.State.ConnectedAt = connectionState.Timestamp
	}
}

func (query NetworkQuery) Get(id uint) (*vo.Network, error) {
	network, err := query.check(id)
	if err != nil {
		return nil, err
	}

	ctx := context.TODO()
	result := vo.NewNetwork(network)
	if gateway, err := query.deviceRepo.Get(ctx, network.GatewayID); err == nil {
		result.AddGateway(gateway)
		result.Gateway.Information, _ = query.deviceInformationRepo.Get(gateway.MacAddress)
		query.setDeviceState(&result.Gateway)
	}

	if devices, err := query.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(network.ID)); err == nil {
		nodes := make([]vo.Device, len(devices))
		for i, device := range devices {
			nodes[i] = vo.NewDevice(device)
			query.setDeviceState(&nodes[i])
		}
		result.SetNodes(nodes)
	}
	return &result, nil
}

func (query NetworkQuery) Paging(page, size int) ([]vo.Network, int64, error) {
	es, total, err := query.networkRepo.PagingBySpecs(context.TODO(), page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Network, len(es))
	for i, network := range es {
		result[i] = vo.NewNetwork(network)
		result[i].Gateway.ID = network.GatewayID
	}
	return result, total, nil
}

func (query NetworkQuery) List() ([]vo.Network, error) {
	es, err := query.networkRepo.FindBySpecs(context.TODO(), query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.Network, len(es))
	for i, network := range es {
		result[i] = vo.NewNetwork(network)
		result[i].Gateway.ID = network.GatewayID
	}
	return result, nil
}
