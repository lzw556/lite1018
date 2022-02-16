package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type NetworkQuery struct {
	entity.Network

	deviceRepo            dependency.DeviceRepository
	deviceStateRepo       dependency.DeviceStateRepository
	deviceInformationRepo dependency.DeviceInformationRepository
}

func NewNetworkQuery() NetworkQuery {
	return NetworkQuery{
		deviceRepo:            repository.Device{},
		deviceStateRepo:       repository.DeviceState{},
		deviceInformationRepo: repository.DeviceInformation{},
	}
}

func (query NetworkQuery) Detail() (*vo.Network, error) {
	ctx := context.TODO()
	result := vo.NewNetwork(query.Network)
	if gateway, err := query.deviceRepo.Get(ctx, query.Network.GatewayID); err == nil {
		result.AddGateway(gateway)
		result.Gateway.Information, _ = query.deviceInformationRepo.Get(gateway.ID)
	}
	if devices, err := query.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(query.Network.ID)); err == nil {
		nodes := make([]vo.Device, len(devices))
		for i, device := range devices {
			nodes[i] = vo.NewDevice(device)
			nodes[i].State, _ = query.deviceStateRepo.Get(device.MacAddress)
		}
		result.SetNodes(nodes)
	}
	return &result, nil
}
