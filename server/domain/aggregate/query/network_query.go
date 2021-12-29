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

	assetRepo             dependency.AssetRepository
	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceInformationRepo dependency.DeviceInformationRepository
}

func NewNetworkQuery() NetworkQuery {
	return NetworkQuery{
		assetRepo:             repository.Asset{},
		deviceRepo:            repository.Device{},
		deviceStatusRepo:      repository.DeviceStatus{},
		deviceInformationRepo: repository.DeviceInformation{},
	}
}

func (query NetworkQuery) Detail() (*vo.Network, error) {
	ctx := context.TODO()
	result := vo.NewNetwork(query.Network)
	if gateway, err := query.deviceRepo.Get(ctx, query.Network.GatewayID); err == nil {
		result.AddGateway(gateway)
		result.Gateway.Information.DeviceInformation, _ = query.deviceInformationRepo.Get(gateway.ID)
	}
	if asset, err := query.assetRepo.Get(ctx, query.Network.AssetID); err == nil {
		result.AddAsset(asset)
	}
	if devices, err := query.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(query.Network.ID)); err == nil {
		nodes := make([]vo.Device, len(devices))
		for i, device := range devices {
			nodes[i] = vo.NewDevice(device)
			nodes[i].State.DeviceStatus, _ = query.deviceStatusRepo.Get(device.ID)
		}
		result.SetNodes(nodes)
	}
	return &result, nil
}
